package com.lifeid.doctorportal.ui.patients

import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.lifeid.doctorportal.data.local.PatientEntity
import com.lifeid.doctorportal.data.repository.PatientRepository
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch

class PatientsViewModel(private val repository: PatientRepository) : ViewModel() {
    var searchQuery by mutableStateOf("")

    val patients: StateFlow<List<PatientEntity>> = repository.allPatients
        .combine(snapshotFlow { searchQuery }) { list, query ->
            if (query.isBlank()) list
            else list.filter {
                it.name.contains(query, ignoreCase = true) ||
                        it.passport.contains(query, ignoreCase = true) ||
                        it.bloodGroup.contains(query, ignoreCase = true)
            }
        }
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    suspend fun getPatientById(id: Long): PatientEntity? {
        return repository.getPatientById(id)
    }

    fun deletePatient(patient: PatientEntity) {
        viewModelScope.launch {
            repository.deletePatient(patient)
        }
    }
}
