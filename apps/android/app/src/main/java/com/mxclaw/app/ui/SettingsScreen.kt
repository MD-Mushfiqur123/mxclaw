package com.mxclaw.app.ui

import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.mxclaw.app.network.WebSocketManager

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SettingsScreen(
    wsManager: WebSocketManager,
    onBack: () -> Unit
) {
    val isConnected by wsManager.isConnected.collectAsState()
    val pairedDeviceId by wsManager.pairedDeviceId.collectAsState()
    var serverUrl by remember { mutableStateOf(wsManager.serverUrl) }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Settings") },
                navigationIcon = {
                    TextButton(onClick = onBack) {
                        Text("Back")
                    }
                }
            )
        }
    ) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            Text("Connection", style = MaterialTheme.typography.titleMedium)

            OutlinedTextField(
                value = serverUrl,
                onValueChange = { serverUrl = it },
                label = { Text("Server URL") },
                modifier = Modifier.fillMaxWidth(),
                singleLine = true
            )

            Button(
                onClick = {
                    wsManager.serverUrl = serverUrl
                    wsManager.connect()
                },
                modifier = Modifier.fillMaxWidth()
            ) {
                Text("Save & Reconnect")
            }

            Spacer(modifier = Modifier.height(8.dp))
            Text("Status", style = MaterialTheme.typography.titleMedium)

            Row(verticalAlignment = Alignment.CenterVertically) {
                Text("Connection: ", modifier = Modifier.weight(1f))
                Text(
                    text = if (isConnected) "Connected" else "Disconnected",
                    color = if (isConnected) MaterialTheme.colorScheme.primary
                    else MaterialTheme.colorScheme.error
                )
            }

            if (pairedDeviceId != null) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Text("Paired Device: ", modifier = Modifier.weight(1f))
                    Text(pairedDeviceId!!, style = MaterialTheme.typography.bodySmall)
                }
            }

            Spacer(modifier = Modifier.height(8.dp))
            Text("About", style = MaterialTheme.typography.titleMedium)
            Text("Version 1.0", style = MaterialTheme.typography.bodySmall)
        }
    }
}
