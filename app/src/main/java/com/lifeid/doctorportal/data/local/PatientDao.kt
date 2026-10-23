package com.lifeid.doctorportal.data.local

import androidx.room.Dao
import androidx.room.Delete
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import androidx.room.Update
import kotlinx.coroutines.flow.Flow

@Dao
interface PatientDao {
    @Query("SELECT * FROM patients ORDER BY registrationDate DESC")
    fun getAllPatients(): Flow<List<PatientEntity>>

    @Query("SELECT * FROM patients WHERE id = :patientId")
    suspend fun getPatientById(patientId: Long): PatientEntity?

    @Query("SELECT * FROM patients WHERE fingerprintId = :fingerprintId")
    suspend fun getPatientByFingerprint(fingerprintId: String): PatientEntity?

    @Query("SELECT * FROM patients WHERE passport = :passport")
    suspend fun getPatientByPassport(passport: String): PatientEntity?

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertPatient(patient: PatientEntity): Long

    @Update
    suspend fun updatePatient(patient: PatientEntity)

    @Delete
    suspend fun deletePatient(patient: PatientEntity)

    @Query("SELECT COUNT(*) FROM patients")
    fun getPatientCount(): Flow<Int>
}
