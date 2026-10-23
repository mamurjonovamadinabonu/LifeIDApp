package com.lifeid.doctorportal.ui.dashboard

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.lifeid.doctorportal.data.local.PatientEntity
import com.lifeid.doctorportal.ui.theme.CrimsonRed

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun DashboardScreen(
    viewModel: DashboardViewModel,
    onNavigateToPatients: () -> Unit,
    onNavigateToAddPatient: () -> Unit,
    onNavigateToScanner: () -> Unit,
    onNavigateToAi: () -> Unit,
    onPatientClick: (Long) -> Unit
) {
    val patientCount by viewModel.patientCount.collectAsState()
    val recentPatients by viewModel.recentPatients.collectAsState()

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("LifeID Doctor Dashboard", color = Color.White) },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = CrimsonRed),
                actions = {
                    IconButton(onClick = onNavigateToAi) {
                        Icon(Icons.Default.Info, contentDescription = "AI Assistant", tint = Color.White)
                    }
                }
            )
        },
        floatingActionButton = {
            FloatingActionButton(
                onClick = onNavigateToAddPatient,
                containerColor = CrimsonRed,
                contentColor = Color.White
            ) {
                Icon(Icons.Default.Add, contentDescription = "Add Patient")
            }
        }
    ) { paddingValues ->
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            // Welcome Card
            item {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    colors = CardDefaults.cardColors(containerColor = CrimsonRed.copy(alpha = 0.1f)),
                    shape = RoundedCornerShape(12.dp)
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Text(
                            text = "Welcome, Dr. Smith",
                            fontSize = 20.sp,
                            fontWeight = FontWeight.Bold,
                            color = CrimsonRed
                        )
                        Spacer(modifier = Modifier.height(4.dp))
                        Text(
                            text = "LifeID Offline-First Secure Medical Portal",
                            fontSize = 13.sp,
                            color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.7f)
                        )
                    }
                }
            }

            // Quick Stats & Actions Grid
            item {
                Text(
                    text = "Quick Actions & Stats",
                    fontSize = 18.sp,
                    fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.onSurface
                )
            }

            item {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    DashboardCard(
                        title = "Registered Patients",
                        value = "$patientCount",
                        icon = Icons.Default.Person,
                        modifier = Modifier.weight(1f),
                        onClick = onNavigateToPatients
                    )
                    DashboardCard(
                        title = "Biometric Scanner",
                        value = "Scan",
                        icon = Icons.Default.Lock,
                        modifier = Modifier.weight(1f),
                        onClick = onNavigateToScanner
                    )
                }
            }

            item {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    DashboardCard(
                        title = "Add New Patient",
                        value = "Wizard",
                        icon = Icons.Default.Add,
                        modifier = Modifier.weight(1f),
                        onClick = onNavigateToAddPatient
                    )
                    DashboardCard(
                        title = "Gemini AI Advisor",
                        value = "Ask AI",
                        icon = Icons.Default.Star,
                        modifier = Modifier.weight(1f),
                        onClick = onNavigateToAi
                    )
                }
            }

            // Recent Patients Section
            item {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = "Recent Patients",
                        fontSize = 18.sp,
                        fontWeight = FontWeight.Bold,
                        color = MaterialTheme.colorScheme.onSurface
                    )
                    TextButton(onClick = onNavigateToPatients) {
                        Text("View All", color = CrimsonRed)
                    }
                }
            }

            if (recentPatients.isEmpty()) {
                item {
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(32.dp),
                        contentAlignment = Alignment.Center
                    ) {
                        Text(
                            text = "No patients registered yet. Tap '+' to add.",
                            color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.5f)
                        )
                    }
                }
            } else {
                items(recentPatients) { patient ->
                    PatientListItem(patient = patient, onClick = { onPatientClick(patient.id) })
                }
            }
        }
    }
}

@Composable
fun DashboardCard(
    title: String,
    value: String,
    icon: ImageVector,
    modifier: Modifier = Modifier,
    onClick: () -> Unit
) {
    Card(
        modifier = modifier
            .height(110.dp)
            .clickable { onClick() },
        shape = RoundedCornerShape(12.dp),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(12.dp),
            verticalArrangement = Arrangement.SpaceBetween
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = title,
                    fontSize = 13.sp,
                    color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.7f),
                    maxLines = 1
                )
                Icon(imageVector = icon, contentDescription = null, tint = CrimsonRed, modifier = Modifier.size(20.dp))
            }
            Text(
                text = value,
                fontSize = 20.sp,
                fontWeight = FontWeight.Bold,
                color = MaterialTheme.colorScheme.onSurface
            )
        }
    }
}

@Composable
fun PatientListItem(patient: PatientEntity, onClick: () -> Unit) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .clickable { onClick() },
        shape = RoundedCornerShape(8.dp),
        elevation = CardDefaults.cardElevation(defaultElevation = 1.dp)
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            Column(modifier = Modifier.weight(1f)) {
                Text(
                    text = patient.name,
                    fontWeight = FontWeight.Bold,
                    fontSize = 16.sp,
                    color = MaterialTheme.colorScheme.onSurface
                )
                Spacer(modifier = Modifier.height(2.dp))
                Text(
                    text = "Passport: ${patient.passport} | Blood: ${patient.bloodGroup}",
                    fontSize = 13.sp,
                    color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.7f)
                )
            }
            Surface(
                shape = RoundedCornerShape(4.dp),
                color = CrimsonRed.copy(alpha = 0.1f)
            ) {
                Text(
                    text = patient.bloodGroup,
                    modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp),
                    color = CrimsonRed,
                    fontWeight = FontWeight.Bold,
                    fontSize = 12.sp
                )
            }
        }
    }
}
