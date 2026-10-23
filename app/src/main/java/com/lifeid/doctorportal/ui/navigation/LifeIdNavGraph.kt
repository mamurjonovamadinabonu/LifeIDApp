package com.lifeid.doctorportal.ui.navigation

import androidx.compose.runtime.Composable
import androidx.compose.ui.platform.LocalContext
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.navigation.NavType
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import androidx.navigation.navArgument
import com.lifeid.doctorportal.data.local.AppDatabase
import com.lifeid.doctorportal.data.repository.PatientRepository
import com.lifeid.doctorportal.ui.ai.GeminiAiScreen
import com.lifeid.doctorportal.ui.ai.GeminiAiViewModel
import com.lifeid.doctorportal.ui.biometric.BiometricScannerScreen
import com.lifeid.doctorportal.ui.biometric.BiometricViewModel
import com.lifeid.doctorportal.ui.dashboard.DashboardScreen
import com.lifeid.doctorportal.ui.dashboard.DashboardViewModel
import com.lifeid.doctorportal.ui.login.LoginScreen
import com.lifeid.doctorportal.ui.login.LoginViewModel
import com.lifeid.doctorportal.ui.patients.PatientDetailScreen
import com.lifeid.doctorportal.ui.patients.PatientListScreen
import com.lifeid.doctorportal.ui.patients.PatientsViewModel
import com.lifeid.doctorportal.ui.wizard.AddPatientViewModel
import com.lifeid.doctorportal.ui.wizard.AddPatientWizardScreen

@Composable
fun LifeIdNavGraph() {
    val navController = rememberNavController()
    val context = LocalContext.current
    val database = AppDatabase.getDatabase(context)
    val repository = PatientRepository(database.patientDao())

    val loginViewModel = LoginViewModel()
    val dashboardViewModel = DashboardViewModel(repository)
    val patientsViewModel = PatientsViewModel(repository)
    val addPatientViewModel = AddPatientViewModel(repository)
    val biometricViewModel = BiometricViewModel(repository)
    val geminiAiViewModel = GeminiAiViewModel()

    NavHost(navController = navController, startDestination = "login") {
        composable("login") {
            LoginScreen(
                viewModel = loginViewModel,
                onLoginSuccess = {
                    navController.navigate("dashboard") {
                        popUpTo("login") { inclusive = true }
                    }
                }
            )
        }
        composable("dashboard") {
            DashboardScreen(
                viewModel = dashboardViewModel,
                onNavigateToPatients = { navController.navigate("patients") },
                onNavigateToAddPatient = {
                    // Reset wizard state if needed
                    navController.navigate("add_patient")
                },
                onNavigateToScanner = { navController.navigate("scanner") },
                onNavigateToAi = { navController.navigate("ai") },
                onPatientClick = { patientId ->
                    navController.navigate("patient_detail/$patientId")
                }
            )
        }
        composable("patients") {
            PatientListScreen(
                viewModel = patientsViewModel,
                onBack = { navController.popBackStack() },
                onPatientClick = { patientId ->
                    navController.navigate("patient_detail/$patientId")
                }
            )
        }
        composable(
            route = "patient_detail/{patientId}",
            arguments = listOf(navArgument("patientId") { type = NavType.LongType })
        ) { backStackEntry ->
            val patientId = backStackEntry.arguments?.getLong("patientId") ?: 0L
            PatientDetailScreen(
                patientId = patientId,
                viewModel = patientsViewModel,
                onBack = { navController.popBackStack() }
            )
        }
        composable("add_patient") {
            AddPatientWizardScreen(
                viewModel = addPatientViewModel,
                onBack = { navController.popBackStack() },
                onSaveSuccess = {
                    navController.popBackStack()
                }
            )
        }
        composable("scanner") {
            BiometricScannerScreen(
                viewModel = biometricViewModel,
                onBack = { navController.popBackStack() },
                onPatientClick = { patientId ->
                    navController.navigate("patient_detail/$patientId")
                }
            )
        }
        composable("ai") {
            GeminiAiScreen(
                viewModel = geminiAiViewModel,
                onBack = { navController.popBackStack() }
            )
        }
    }
}
