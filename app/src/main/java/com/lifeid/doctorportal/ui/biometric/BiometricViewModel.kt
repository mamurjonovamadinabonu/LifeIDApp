package com.lifeid.doctorportal.ui.biometric

import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.lifeid.doctorportal.data.local.PatientEntity
import com.lifeid.doctorportal.data.repository.PatientRepository
import kotlinx.coroutines.launch

class BiometricViewModel(private val repository: PatientRepository) : ViewModel() {
    var isScanning by mutableStateOf(false)
    var scannedPatient by mutableStateOf<PatientEntity?>(null)
    var errorMessage by mutableStateOf<String?>(null)

    fun startBiometricScan() {
        isScanning = true
        errorMessage = null
        scannedPatient = null

        viewModelScope.launch {
            // Simulate fingerprint biometric search against local Room DB
            kotlinx.coroutines.delay(2000)
            isScanning = false
            // Fetch first patient or simulate match
            repository.allPatients.collect { list ->
                if (list.isNotEmpty()) {
                    scannedPatient = list.random()
                } else {
                    errorMessage = "No registered patients found in local database."
                }
                // Stop collection after first emission
                throw kotlinx.coroutines.CancellationException()
            }
        }
    }

    fun searchByFingerprintId(fingerprintId: String) {
        if (fingerprintId.isBlank()) {
            errorMessage = "Please enter a Fingerprint ID."
            return
        }
        viewModelScope.launch {
            isScanning = true
            errorMessage = null
            kotlinx.coroutines.delay(1000)
            val patient = repository.getPatientByFingerprint(fingerprintId)
            isScanning = false
            if (patient != null) {
                scannedPatient = patient
            } else {
                errorMessage = "No patient found matching Fingerprint ID: $fingerprintId"
            }
        }
    }
}
