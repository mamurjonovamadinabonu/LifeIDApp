package com.lifeid.doctorportal.ui.wizard

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.lifeid.doctorportal.ui.theme.CrimsonRed

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AddPatientWizardScreen(
    viewModel: AddPatientViewModel,
    onBack: () -> Unit,
    onSaveSuccess: () -> Unit
) {
    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Add Patient Wizard (Step ${viewModel.currentStep}/4)", color = Color.White) },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.Default.ArrowBack, contentDescription = "Back", tint = Color.White)
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = CrimsonRed)
            )
        }
    ) { paddingValues ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
                .padding(16.dp)
                .verticalScroll(rememberScrollState()),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            // Step Indicator Progress Bar
            LinearProgressIndicator(
                progress = viewModel.currentStep / 4f,
                modifier = Modifier
                    .fillMaxWidth()
                    .height(8.dp)
                    .clip(RoundedCornerShape(4.dp)),
                color = CrimsonRed,
                trackColor = CrimsonRed.copy(alpha = 0.2f)
            )

            // Step Titles
            val stepTitle = when (viewModel.currentStep) {
                1 -> "Step 1: Personal Information"
                2 -> "Step 2: Medical Information"
                3 -> "Step 3: Biometric Fingerprint"
                4 -> "Step 4: Review & Confirm"
                else -> ""
            }

            Text(
                text = stepTitle,
                fontSize = 20.sp,
                fontWeight = FontWeight.Bold,
                color = MaterialTheme.colorScheme.onSurface
            )

            if (viewModel.errorMessage != null) {
                Card(
                    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.errorContainer)
                ) {
                    Text(
                        text = viewModel.errorMessage!!,
                        color = MaterialTheme.colorScheme.onErrorContainer,
                        modifier = Modifier.padding(12.dp)
                    )
                }
            }

            // Step Content
            when (viewModel.currentStep) {
                1 -> Step1PersonalContent(viewModel)
                2 -> Step2MedicalContent(viewModel)
                3 -> Step3BiometricContent(viewModel)
                4 -> Step4ConfirmationContent(viewModel)
            }

            Spacer(modifier = Modifier.height(24.dp))

            // Navigation Buttons
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                if (viewModel.currentStep > 1) {
                    OutlinedButton(
                        onClick = { viewModel.prevStep() },
                        modifier = Modifier
                            .weight(1f)
                            .height(50.dp)
                    ) {
                        Text("Previous")
                    }
                    Spacer(modifier = Modifier.width(16.dp))
                }

                Button(
                    onClick = {
                        if (viewModel.currentStep == 4) {
                            viewModel.savePatient(onSaveSuccess)
                        } else {
                            viewModel.nextStep()
                        }
                    },
                    modifier = Modifier
                        .weight(1f)
                        .height(50.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = CrimsonRed)
                ) {
                    Text(if (viewModel.currentStep == 4) "Save Patient" else "Next")
                }
            }
        }
    }
}

@Composable
fun Step1PersonalContent(viewModel: AddPatientViewModel) {
    Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
        OutlinedTextField(
            value = viewModel.name,
            onValueChange = { viewModel.name = it },
            label = { Text("Full Name *") },
            modifier = Modifier.fillMaxWidth(),
            singleLine = true
        )
        OutlinedTextField(
            value = viewModel.passport,
            onValueChange = { viewModel.passport = it },
            label = { Text("Passport / ID Number *") },
            modifier = Modifier.fillMaxWidth(),
            singleLine = true
        )
        OutlinedTextField(
            value = viewModel.phone,
            onValueChange = { viewModel.phone = it },
            label = { Text("Phone Number") },
            modifier = Modifier.fillMaxWidth(),
            singleLine = true
        )
        OutlinedTextField(
            value = viewModel.dateOfBirth,
            onValueChange = { viewModel.dateOfBirth = it },
            label = { Text("Date of Birth (YYYY-MM-DD)") },
            modifier = Modifier.fillMaxWidth(),
            singleLine = true
        )
        OutlinedTextField(
            value = viewModel.gender,
            onValueChange = { viewModel.gender = it },
            label = { Text("Gender") },
            modifier = Modifier.fillMaxWidth(),
            singleLine = true
        )
    }
}

@Composable
fun Step2MedicalContent(viewModel: AddPatientViewModel) {
    Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
        OutlinedTextField(
            value = viewModel.bloodGroup,
            onValueChange = { viewModel.bloodGroup = it },
            label = { Text("Blood Group (e.g. A+, O-, AB+) *") },
            modifier = Modifier.fillMaxWidth(),
            singleLine = true
        )
        OutlinedTextField(
            value = viewModel.allergies,
            onValueChange = { viewModel.allergies = it },
            label = { Text("Allergies (e.g. Penicillin, Peanuts)") },
            modifier = Modifier.fillMaxWidth()
        )
        OutlinedTextField(
            value = viewModel.chronicConditions,
            onValueChange = { viewModel.chronicConditions = it },
            label = { Text("Chronic Conditions (e.g. Diabetes, Hypertension)") },
            modifier = Modifier.fillMaxWidth()
        )
        OutlinedTextField(
            value = viewModel.emergencyContact,
            onValueChange = { viewModel.emergencyContact = it },
            label = { Text("Emergency Contact (Name & Phone)") },
            modifier = Modifier.fillMaxWidth(),
            singleLine = true
        )
        OutlinedTextField(
            value = viewModel.notes,
            onValueChange = { viewModel.notes = it },
            label = { Text("Additional Clinical Notes") },
            modifier = Modifier.fillMaxWidth()
        )
    }
}

@Composable
fun Step3BiometricContent(viewModel: AddPatientViewModel) {
    Column(
        modifier = Modifier.fillMaxWidth(),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        Text(
            text = "Register Patient Fingerprint Biometric ID for instant offline identification.",
            fontSize = 14.sp,
            color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.7f)
        )

        Spacer(modifier = Modifier.height(16.dp))

        Box(
            modifier = Modifier
                .size(120.dp)
                .clip(CircleShape)
                .background(CrimsonRed.copy(alpha = 0.1f)),
            contentAlignment = Alignment.Center
        ) {
            Icon(
                imageVector = Icons.Default.Lock,
                contentDescription = "Fingerprint",
                tint = CrimsonRed,
                modifier = Modifier.size(64.dp)
            )
        }

        if (viewModel.isScanning) {
            CircularProgressIndicator(color = CrimsonRed)
            Text("Scanning fingerprint sensor...", color = CrimsonRed, fontWeight = FontWeight.Bold)
        } else if (viewModel.scanSuccess) {
            Text("Fingerprint Registered Successfully!", color = Color(0xFF2E7D32), fontWeight = FontWeight.Bold)
            Text("Fingerprint ID: ${viewModel.fingerprintId}", fontSize = 14.sp, fontWeight = FontWeight.Medium)
        } else {
            Button(
                onClick = { viewModel.simulateFingerprintScan() },
                colors = ButtonDefaults.buttonColors(containerColor = CrimsonRed)
            ) {
                Text("Start Fingerprint Scan")
            }
        }

        Spacer(modifier = Modifier.height(8.dp))
        OutlinedTextField(
            value = viewModel.fingerprintId,
            onValueChange = { viewModel.fingerprintId = it },
            label = { Text("Fingerprint ID (Auto or Manual)") },
            modifier = Modifier.fillMaxWidth(),
            singleLine = true
        )
    }
}

@Composable
fun Step4ConfirmationContent(viewModel: AddPatientViewModel) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Column(
            modifier = Modifier.padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            Text("Review Patient Details", fontWeight = FontWeight.Bold, fontSize = 18.sp, color = CrimsonRed)
            Divider()
            SummaryRow("Full Name:", viewModel.name)
            SummaryRow("Passport:", viewModel.passport)
            SummaryRow("Phone:", viewModel.phone.ifBlank { "N/A" })
            SummaryRow("DOB:", viewModel.dateOfBirth.ifBlank { "N/A" })
            SummaryRow("Gender:", viewModel.gender.ifBlank { "N/A" })
            SummaryRow("Blood Group:", viewModel.bloodGroup)
            SummaryRow("Allergies:", viewModel.allergies.ifBlank { "None" })
            SummaryRow("Chronic Conditions:", viewModel.chronicConditions.ifBlank { "None" })
            SummaryRow("Emergency Contact:", viewModel.emergencyContact.ifBlank { "N/A" })
            SummaryRow("Fingerprint ID:", viewModel.fingerprintId.ifBlank { "Not Registered" })
        }
    }
}

@Composable
fun SummaryRow(label: String, value: String) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceBetween
    ) {
        Text(text = label, fontWeight = FontWeight.Medium, color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.7f))
        Text(text = value, fontWeight = FontWeight.Bold, color = MaterialTheme.colorScheme.onSurface)
    }
}
