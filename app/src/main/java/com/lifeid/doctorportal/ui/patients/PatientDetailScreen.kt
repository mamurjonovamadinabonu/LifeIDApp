package com.lifeid.doctorportal.ui.patients

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.Person
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.lifeid.doctorportal.data.local.PatientEntity
import com.lifeid.doctorportal.ui.wizard.SummaryRow
import com.lifeid.doctorportal.ui.theme.CrimsonRed
import kotlinx.coroutines.launch

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun PatientDetailScreen(
    patientId: Long,
    viewModel: PatientsViewModel,
    onBack: () -> Unit
) {
    val scope = rememberCoroutineScope()
    var patient by remember { mutableStateOf<PatientEntity?>(null) }
    var isLoading by remember { mutableStateOf(true) }

    LaunchedEffect(patientId) {
        patient = viewModel.getPatientById(patientId)
        isLoading = false
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Patient Medical Card", color = Color.White) },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.Default.ArrowBack, contentDescription = "Back", tint = Color.White)
                    }
                },
                actions = {
                    if (patient != null) {
                        IconButton(onClick = {
                            viewModel.deletePatient(patient!!)
                            onBack()
                        }) {
                            Icon(Icons.Default.Delete, contentDescription = "Delete Patient", tint = Color.White)
                        }
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = CrimsonRed)
            )
        }
    ) { paddingValues ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues),
            contentAlignment = Alignment.Center
        ) {
            if (isLoading) {
                CircularProgressIndicator(color = CrimsonRed)
            } else if (patient == null) {
                Text("Patient not found", color = MaterialTheme.colorScheme.error)
            } else {
                Column(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(16.dp)
                        .verticalScroll(rememberScrollState()),
                    verticalArrangement = Arrangement.spacedBy(16.dp)
                ) {
                    // Header Card
                    Card(
                        modifier = Modifier.fillMaxWidth(),
                        colors = CardDefaults.cardColors(containerColor = CrimsonRed.copy(alpha = 0.1f)),
                        shape = RoundedCornerShape(12.dp)
                    ) {
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(16.dp),
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(16.dp)
                        ) {
                            Box(
                                modifier = Modifier
                                    .size(60.dp)
                                    .clip(CircleShape)
                                    .background(CrimsonRed),
                                contentAlignment = Alignment.Center
                            ) {
                                Icon(
                                    imageVector = Icons.Default.Person,
                                    contentDescription = null,
                                    tint = Color.White,
                                    modifier = Modifier.size(36.dp)
                                )
                            }
                            Column(modifier = Modifier.weight(1f)) {
                                Text(
                                    text = patient!!.name,
                                    fontSize = 20.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = CrimsonRed
                                )
                                Spacer(modifier = Modifier.height(2.dp))
                                Text(
                                    text = "Passport: ${patient!!.passport}",
                                    fontSize = 14.sp,
                                    color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.7f)
                                )
                            }
                        }
                    }

                    // Detailed Medical Card
                    Card(
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(12.dp),
                        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
                    ) {
                        Column(
                            modifier = Modifier.padding(16.dp),
                            verticalArrangement = Arrangement.spacedBy(12.dp)
                        ) {
                            Text("Personal Details", fontWeight = FontWeight.Bold, fontSize = 16.sp, color = CrimsonRed)
                            Divider()
                            SummaryRow("Phone Number", patient!!.phone.ifBlank { "N/A" })
                            SummaryRow("Date of Birth", patient!!.dateOfBirth.ifBlank { "N/A" })
                            SummaryRow("Gender", patient!!.gender.ifBlank { "N/A" })

                            Spacer(modifier = Modifier.height(8.dp))
                            Text("Medical Profile", fontWeight = FontWeight.Bold, fontSize = 16.sp, color = CrimsonRed)
                            Divider()
                            SummaryRow("Blood Group", patient!!.bloodGroup)
                            SummaryRow("Allergies", patient!!.allergies.ifBlank { "None reported" })
                            SummaryRow("Chronic Conditions", patient!!.chronicConditions.ifBlank { "None reported" })

                            Spacer(modifier = Modifier.height(8.dp))
                            Text("Emergency & Biometrics", fontWeight = FontWeight.Bold, fontSize = 16.sp, color = CrimsonRed)
                            Divider()
                            SummaryRow("Emergency Contact", patient!!.emergencyContact.ifBlank { "N/A" })
                            SummaryRow("Fingerprint ID", patient!!.fingerprintId.ifBlank { "Not registered" })
                            SummaryRow("Clinical Notes", patient!!.notes.ifBlank { "None" })
                        }
                    }
                }
            }
        }
    }
}
