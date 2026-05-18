package com.mxclaw.app.network

import com.mxclaw.app.model.ChatMessage
import kotlinx.coroutines.channels.Channel
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.Response
import okhttp3.WebSocket
import okhttp3.WebSocketListener
import org.json.JSONObject
import java.util.UUID
import java.util.concurrent.TimeUnit

class WebSocketManager {

    private val client = OkHttpClient.Builder()
        .readTimeout(0, TimeUnit.MILLISECONDS)
        .build()

    private var webSocket: WebSocket? = null

    private val _isConnected = MutableStateFlow(false)
    val isConnected: StateFlow<Boolean> = _isConnected.asStateFlow()

    private val _messages = MutableStateFlow<List<ChatMessage>>(emptyList())
    val messages: StateFlow<List<ChatMessage>> = _messages.asStateFlow()

    private val _pairedDeviceId = MutableStateFlow<String?>(null)
    val pairedDeviceId: StateFlow<String?> = _pairedDeviceId.asStateFlow()

    var serverUrl: String
        get() = prefsGet("server_url", "ws://localhost:18700")
        set(value) = prefsSet("server_url", value)

    fun connect() {
        disconnect()
        val url = serverUrl
        val request = Request.Builder()
            .url(url)
            .build()

        webSocket = client.newWebSocket(request, object : WebSocketListener() {
            override fun onOpen(webSocket: WebSocket, response: Response) {
                _isConnected.value = true
            }

            override fun onMessage(webSocket: WebSocket, text: String) {
                handleMessage(text)
            }

            override fun onFailure(webSocket: WebSocket, t: Throwable, response: Response?) {
                _isConnected.value = false
            }

            override fun onClosed(webSocket: WebSocket, code: Int, reason: String) {
                _isConnected.value = false
            }
        })
    }

    fun disconnect() {
        webSocket?.close(1000, "Client closing")
        webSocket = null
        _isConnected.value = false
    }

    fun sendChat(text: String) {
        val uuid = UUID.randomUUID().toString()
        val localMsg = ChatMessage(
            id = uuid,
            role = "user",
            content = text,
            timestamp = null
        )
        val current = _messages.value.toMutableList()
        current.add(localMsg)
        _messages.value = current

        val payload = JSONObject().apply {
            put("type", "chat:send")
            put("message", text)
            put("id", uuid)
        }
        webSocket?.send(payload.toString())
    }

    fun sendPairCode(code: String) {
        val payload = JSONObject().apply {
            put("type", "pair:request")
            put("code", code)
        }
        webSocket?.send(payload.toString())
    }

    private fun handleMessage(text: String) {
        try {
            val json = JSONObject(text)
            when (json.optString("type")) {
                "pair:success" -> {
                    val deviceId = json.optString("deviceId")
                    _pairedDeviceId.value = deviceId
                }
                else -> {
                    val msg = ChatMessage.fromJson(json)
                    if (msg.id.isNotBlank()) {
                        val current = _messages.value.toMutableList()
                        current.add(msg)
                        _messages.value = current
                    }
                }
            }
        } catch (_: Exception) {
        }
    }

    private fun prefsGet(key: String, default: String): String {
        // Simplified - in real app use SharedPreferences
        return default
    }

    private fun prefsSet(key: String, value: String) {
        // Simplified - in real app use SharedPreferences
    }
}
