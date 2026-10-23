package com.lifeid.doctorportal.data.repository

import com.lifeid.doctorportal.data.local.PatientDao
import com.lifeid.doctorportal.data.local.PatientEntity
import kotlinx.coroutines.flow.Flow

class PatientRepository(private val patientDao: PatientDao) {
    val allPatients: Flow<List<PatientEntity>> = patientDao.getAllPatients()
    val patientCount: Flow<Int> = patientDao.getPatientCount()

    suspend fun getPatientById(id: Long): PatientEntity? {
        return patientDao.getPatientById(id)
    }

    suspend fun getPatientByFingerprint(fingerprintId: String): PatientEntity? {
        return patientDao.getPatientByFingerprint(fingerprintId)
    }

    suspend fun insertPatient(patient: PatientEntity): Long {
        return patientDao.insertPatient(patient)
    }

    suspend fun updatePatient(patient: PatientEntity) {
        patientDao.updatePatient(patient)
    }

    suspend fun deletePatient(patient: PatientEntity) {
        patientDao.deletePatient(patient)
    }
}
