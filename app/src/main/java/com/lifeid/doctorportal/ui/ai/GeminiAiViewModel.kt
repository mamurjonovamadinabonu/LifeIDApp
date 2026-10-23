package com.lifeid.doctorportal.ui.ai

import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch

data class ChatMessage(val text: String, val isUser: Boolean)

class GeminiAiViewModel : ViewModel() {
    var userInput by mutableStateOf("")
    var chatMessages by mutableStateOf(
        listOf(
            ChatMessage("Hello Dr. Smith! I am your LifeID Gemini AI Medical Advisor. How can I assist you with clinical diagnostics, drug interactions, or patient triage today?", false)
        )
    )
    var isLoading by mutableStateOf(false)

    fun sendMessage() {
        if (userInput.isBlank()) return
        val query = userInput
        userInput = ""

        chatMessages = chatMessages + ChatMessage(query, true)
        isLoading = true

        viewModelScope.launch {
            delay(1200) // Simulate Gemini AI response
            val aiResponse = when {
                query.contains("diabetes", ignoreCase = true) ->
                    "For Type 2 Diabetes management: Monitor HbA1c regularly, recommend lifestyle modifications, metformin titration as indicated, and check renal function."
                query.contains("allergy", ignoreCase = true) ->
                    "Always cross-reference patient allergy records before prescribing beta-lactams or sulfonamides. Check LifeID biometric medical card for specific allergen alerts."
                query.contains("blood pressure", ignoreCase = true) || query.contains("hypertension", ignoreCase = true) ->
                    "Hypertension guidelines suggest ACE inhibitors or ARBs as first-line therapy for patients with diabetes or CKD, combined with sodium restriction."
                else ->
                    "Based on LifeID clinical protocols: Ensure thorough offline medical history review, verify patient biometric ID, and consult specialist if adverse symptoms persist."
            }
            chatMessages = chatMessages + ChatMessage(aiResponse, false)
            isLoading = false
        }
    }
}
