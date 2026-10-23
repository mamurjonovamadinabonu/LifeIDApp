package com.lifeid.doctorportal.ui.dashboard

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.lifeid.doctorportal.data.local.PatientEntity
import com.lifeid.doctorportal.data.repository.PatientRepository
import kotlinx.coroutines.flow.*

class DashboardViewModel(repository: PatientRepository) : ViewModel() {
    val patientCount: StateFlow<Int> = repository.patientCount
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), 0)

    val recentPatients: StateFlow<List<PatientEntity>> = repository.allPatients
        .map { it.take(5) }
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())
}
