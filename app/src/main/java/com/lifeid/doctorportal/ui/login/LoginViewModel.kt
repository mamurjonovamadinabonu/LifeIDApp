package com.lifeid.doctorportal.ui.login

import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import androidx.lifecycle.ViewModel

class LoginViewModel : ViewModel() {
    var doctorId by mutableStateOf("")
    var password by mutableStateOf("")
    var isLoading by mutableStateOf(false)
    var errorMessage by mutableStateOf<String?>(null)

    fun login(onSuccess: () -> Unit) {
        if (doctorId.isBlank() || password.isBlank()) {
            errorMessage = "Please enter Doctor ID and Password"
            return
        }
        isLoading = true
        errorMessage = null
        // Simulate login
        if (doctorId == "doc123" && password == "password") {
            isLoading = false
            onSuccess()
        } else if (doctorId.isNotEmpty() && password.isNotEmpty()) {
            // Allow any test credentials for convenience
            isLoading = false
            onSuccess()
        } else {
            isLoading = false
            errorMessage = "Invalid credentials. Try doc123 / password"
        }
    }
}
