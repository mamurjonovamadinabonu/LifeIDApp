package com.lifeid.doctorportal.data.local

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "patients")
data class PatientEntity(
    @PrimaryKey(autoGenerate = true)
    val id: Long = 0L,
    val name: String,
    val passport: String,
    val bloodGroup: String,
    val allergies: String,
    val chronicConditions: String,
    val fingerprintId: String,
    val phone: String = "",
    val dateOfBirth: String = "",
    val gender: String = "",
    val emergencyContact: String = "",
    val notes: String = "",
    val registrationDate: Long = System.currentTimeMillis()
)
