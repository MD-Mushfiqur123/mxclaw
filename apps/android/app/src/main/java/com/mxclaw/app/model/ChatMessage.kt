package com.mxclaw.app.model

import org.json.JSONObject

data class ChatMessage(
    val id: String,
    val role: String,
    val content: String,
    val timestamp: String? = null
) {
    companion object {
        fun fromJson(json: JSONObject): ChatMessage {
            return ChatMessage(
                id = json.optString("id", ""),
                role = json.optString("role", ""),
                content = json.optString("content", ""),
                timestamp = json.optString("timestamp", null)
            )
        }
    }
}
