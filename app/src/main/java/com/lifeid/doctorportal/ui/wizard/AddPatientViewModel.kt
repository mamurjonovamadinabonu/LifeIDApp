package com.lifeid.doctorportal.ui.wizard

import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.lifeid.doctorportal.data.local.PatientEntity
import com.lifeid.doctorportal.data.repository.PatientRepository
import kotlinx.coroutines.launch

class AddPatientViewModel(private val repository: PatientRepository) : ViewModel() {
    var currentStep by mutableStateOf(1)

    // Step 1: Personal Info
    var name by mutableStateOf("")
    var passport by mutableStateOf("")
    var phone by mutableStateOf("")
    var dateOfBirth by mutableStateOf("")
    var gender by mutableStateOf("")

    // Step 2: Medical Info
    var bloodGroup by mutableStateOf("A+")
    var allergies by mutableStateOf("")
    var chronicConditions by mutableStateOf("")
    var emergencyContact by mutableStateOf("")
    var notes by mutableStateOf("")

    // Step 3: Biometrics
    var fingerprintId by mutableStateOf("")
    var isScanning by mutableStateOf(false)
    var scanSuccess by mutableStateOf(false)

    var errorMessage by mutableStateOf<String?>(null)

    fun nextStep() {
        errorMessage = null
        when (currentStep) {
            1 -> {
                if (name.isBlank() || passport.isBlank()) {
                    errorMessage = "Name and Passport are required."
                    return
                }
                currentStep = 2
            }
            2 -> {
                if (bloodGroup.isBlank()) {
                    errorMessage = "Blood group is required."
                    return
                }
                currentStep = 3
            }
            3 -> {
                if (fingerprintId.isBlank()) {
                    errorMessage = "Please scan or generate a fingerprint ID."
                    return
                }
                currentStep = 4
            }
        }
    }

    fun prevStep() {
        errorMessage = null
        if (currentStep > 1) {
            currentStep--
        }
    }

    fun simulateFingerprintScan() {
        isScanning = true
        errorMessage = null
        android.os.Handler(android.os.Looper.getMainLooper()).postDelayed({
            isScanning = false
            scanSuccess = true
            fingerprintId = "FP-${(100000..999999).random()}"
        }, 1500)
    }

    fun savePatient(onSuccess: () -> Unit) {
        viewModelScope.launch {
            val patient = PatientEntity(
                name = name,
                passport = passport,
                bloodGroup = bloodGroup,
                allergies = allergies,
                chronicConditions = chronicConditions,
                fingerprintId = fingerprintId,
                phone = phone,
                dateOfBirth = dateOfBirth,
                gender = gender,
                emergencyContact = emergencyContact,
                notes = notes
            )
            repository.insertPatient(patient)
            onSuccess()
        }
    }
}
