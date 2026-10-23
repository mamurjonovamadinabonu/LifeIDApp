package com.lifeid.doctorportal.ui.biometric

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.Lock
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
import com.lifeid.doctorportal.ui.theme.CrimsonRed

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun BiometricScannerScreen(
    viewModel: BiometricViewModel,
    onBack: () -> Unit,
    onPatientClick: (Long) -> Unit
) {
    var manualId by remember { mutableStateOf("") }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Biometric Fingerprint Scanner", color = Color.White) },
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
                .padding(24.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center
        ) {
            Box(
                modifier = Modifier
                    .size(140.dp)
                    .clip(CircleShape)
                    .background(CrimsonRed.copy(alpha = 0.1f)),
                contentAlignment = Alignment.Center
            ) {
                Icon(
                    imageVector = Icons.Default.Lock,
                    contentDescription = "Scanner",
                    tint = CrimsonRed,
                    modifier = Modifier.size(80.dp)
                )
            }

            Spacer(modifier = Modifier.height(24.dp))

            Text(
                text = "Place Finger on Scanner",
                fontSize = 22.sp,
                fontWeight = FontWeight.Bold,
                color = MaterialTheme.colorScheme.onSurface
            )

            Text(
                text = "Authenticate patient offline via biometric sensor",
                fontSize = 14.sp,
                color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.7f)
            )

            Spacer(modifier = Modifier.height(24.dp))

            if (viewModel.isScanning) {
                CircularProgressIndicator(color = CrimsonRed)
                Spacer(modifier = Modifier.height(8.dp))
                Text("Matching fingerprint in local database...", color = CrimsonRed, fontWeight = FontWeight.Bold)
            } else {
                Button(
                    onClick = { viewModel.startBiometricScan() },
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(50.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = CrimsonRed),
                    shape = RoundedCornerShape(8.dp)
                ) {
                    Text("Start Biometric Scan", fontSize = 16.sp, fontWeight = FontWeight.Bold)
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Divider(modifier = Modifier.weight(1f))
                Text(" OR ", fontSize = 12.sp, color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.5f))
                Divider(modifier = Modifier.weight(1f))
            }

            Spacer(modifier = Modifier.height(16.dp))

            OutlinedTextField(
                value = manualId,
                onValueChange = { manualId = it },
                label = { Text("Enter Fingerprint ID manually (e.g. FP-123456)") },
                modifier = Modifier.fillMaxWidth(),
                singleLine = true
            )

            Spacer(modifier = Modifier.height(8.dp))

            OutlinedButton(
                onClick = { viewModel.searchByFingerprintId(manualId) },
                modifier = Modifier.fillMaxWidth()
            ) {
                Text("Search by Fingerprint ID")
            }

            if (viewModel.errorMessage != null) {
                Spacer(modifier = Modifier.height(12.dp))
                Text(text = viewModel.errorMessage!!, color = MaterialTheme.colorScheme.error)
            }

            if (viewModel.scannedPatient != null) {
                Spacer(modifier = Modifier.height(16.dp))
                Card(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clickable { onPatientClick(viewModel.scannedPatient!!.id) },
                    colors = CardDefaults.cardColors(containerColor = CrimsonRed.copy(alpha = 0.1f)),
                    shape = RoundedCornerShape(12.dp)
                ) {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(16.dp),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Column {
                            Text(text = "Match Found!", fontWeight = FontWeight.Bold, color = CrimsonRed)
                            Text(text = viewModel.scannedPatient!!.name, fontSize = 18.sp, fontWeight = FontWeight.Bold)
                            Text(text = "Passport: ${viewModel.scannedPatient!!.passport} | Blood: ${viewModel.scannedPatient!!.bloodGroup}")
                        }
                        Icon(imageVector = Icons.Default.Person, contentDescription = null, tint = CrimsonRed)
                    }
                }
            }
        }
    }
}
