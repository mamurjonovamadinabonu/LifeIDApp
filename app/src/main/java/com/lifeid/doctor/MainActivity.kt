package com.lifeid.doctor

import android.Manifest
import android.content.Intent
import android.content.pm.PackageManager
import android.net.Uri
import android.os.Bundle
import android.webkit.JavascriptInterface
import android.webkit.PermissionRequest
import android.webkit.WebChromeClient
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.appcompat.app.AppCompatActivity
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat
import androidx.biometric.BiometricManager
import androidx.biometric.BiometricPrompt
import java.util.concurrent.Executor

class MainActivity : AppCompatActivity() {
    lateinit var webView: WebView

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        // Check permissions for camera and phone call
        val permissionsNeeded = mutableListOf<String>()
        if (ContextCompat.checkSelfPermission(this, Manifest.permission.CALL_PHONE) != PackageManager.PERMISSION_GRANTED) {
            permissionsNeeded.add(Manifest.permission.CALL_PHONE)
        }
        if (ContextCompat.checkSelfPermission(this, Manifest.permission.CAMERA) != PackageManager.PERMISSION_GRANTED) {
            permissionsNeeded.add(Manifest.permission.CAMERA)
        }
        if (permissionsNeeded.isNotEmpty()) {
            ActivityCompat.requestPermissions(this, permissionsNeeded.toTypedArray(), 100)
        }

        webView = findViewById(R.id.webView)
        val settings: WebSettings = webView.settings
        settings.javaScriptEnabled = true
        settings.domStorageEnabled = true
        settings.databaseEnabled = true
        settings.allowFileAccess = true
        settings.allowContentAccess = true
        settings.loadWithOverviewMode = true
        settings.useWideViewPort = true
        settings.mixedContentMode = WebSettings.MIXED_CONTENT_ALWAYS_ALLOW

        // Add JavaScript Interface for Biometric Fingerprint Scanner (Samsung / Android BiometricPrompt)
        webView.addJavascriptInterface(WebAppInterface(this), "AndroidBio")

        webView.webViewClient = object : WebViewClient() {
            override fun shouldOverrideUrlLoading(
                view: WebView?,
                request: android.webkit.WebResourceRequest?
            ): Boolean {
                val url = request?.url?.toString()
                if (url != null && url.startsWith("tel:")) {
                    val intent = Intent(Intent.ACTION_DIAL, Uri.parse(url))
                    startActivity(deviceIntent(intent))
                    return true
                }
                return false
            }
        }

        webView.webChromeClient = object : WebChromeClient() {
            override fun onPermissionRequest(request: PermissionRequest?) {
                request?.grant(request.resources)
            }
        }

        // Load local index.html or server URL
        webView.loadUrl("file:///android_asset/index.html")

        onBackPressedDispatcher.addCallback(this, object : androidx.activity.OnBackPressedCallback(true) {
            override fun handleOnBackPressed() {
                if (webView.canGoBack()) {
                    webView.goBack()
                } else {
                    isEnabled = false
                    onBackPressedDispatcher.onBackPressed()
                }
            }
        })
    }

    private fun deviceIntent(intent: Intent): Intent {
        return intent
    }

    class WebAppInterface(private val activity: AppCompatActivity) {
        @JavascriptInterface
        fun requestBiometricScan(callbackId: String) {
            activity.runOnUiThread {
                try {
                    val biometricManager = BiometricManager.from(activity)
                    val authStatus = biometricManager.canAuthenticate(
                        BiometricManager.Authenticators.BIOMETRIC_STRONG or BiometricManager.Authenticators.BIOMETRIC_WEAK
                    )

                    if (authStatus != BiometricManager.BIOMETRIC_SUCCESS) {
                        // If biometrics not set up, notify JS or fallback
                        activity.runOnUiThread {
                            (activity as MainActivity).webView.evaluateJavascript(
                                "if(window.onBiometricError) window.onBiometricError('$callbackId', 'Biometrik sensor topilmadi yoki barmoq izi sozlanmagan');", null
                            )
                        }
                        return@runOnUiThread
                    }

                    val executor: Executor = ContextCompat.getMainExecutor(activity)
                    val biometricPrompt = BiometricPrompt(activity, executor,
                        object : BiometricPrompt.AuthenticationCallback() {
                            override fun onAuthenticationSucceeded(result: BiometricPrompt.AuthenticationResult) {
                                super.onAuthenticationSucceeded(result)
                                val fpId = "fp_hw_samsung_" + System.currentTimeMillis()
                                activity.runOnUiThread {
                                    (activity as MainActivity).webView.evaluateJavascript(
                                        "if(window.onBiometricSuccess) window.onBiometricSuccess('$callbackId', '$fpId');", null
                                    )
                                }
                            }

                            override fun onAuthenticationError(errorCode: Int, errString: CharSequence) {
                                super.onAuthenticationError(errorCode, errString)
                                activity.runOnUiThread {
                                    (activity as MainActivity).webView.evaluateJavascript(
                                        "if(window.onBiometricError) window.onBiometricError('$callbackId', '$errString');", null
                                    )
                                }
                            }

                            override fun onAuthenticationFailed() {
                                super.onAuthenticationFailed()
                            }
                        })

                    val promptInfo = BiometricPrompt.PromptInfo.Builder()
                        .setTitle("LifeID Barmoq Izi Skaneri")
                        .setSubtitle("Telefoningizning sensoriga teging (Samsung / Biometrik)")
                        .setNegativeButtonText("Bekor qilish")
                        .build()

                    biometricPrompt.authenticate(promptInfo)
                } catch (e: Exception) {
                    activity.runOnUiThread {
                        (activity as MainActivity).webView.evaluateJavascript(
                            "if(window.onBiometricError) window.onBiometricError('$callbackId', '${e.message}');", null
                        )
                    }
                }
            }
        }
    }
}
