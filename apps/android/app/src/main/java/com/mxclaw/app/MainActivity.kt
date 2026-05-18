package com.mxclaw.app

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.ui.Modifier
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import com.mxclaw.app.network.WebSocketManager
import com.mxclaw.app.ui.ChatScreen
import com.mxclaw.app.ui.PairingScreen
import com.mxclaw.app.ui.SettingsScreen

class MainActivity : ComponentActivity() {

    private val wsManager = WebSocketManager()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        wsManager.connect()

        setContent {
            MaterialTheme {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = MaterialTheme.colorScheme.background
                ) {
                    val navController = rememberNavController()
                    NavHost(
                        navController = navController,
                        startDestination = "chat"
                    ) {
                        composable("chat") {
                            ChatScreen(
                                wsManager = wsManager,
                                onNavigateToPair = { navController.navigate("pair") },
                                onNavigateToSettings = { navController.navigate("settings") }
                            )
                        }
                        composable("pair") {
                            PairingScreen(
                                wsManager = wsManager,
                                onBack = { navController.popBackStack() }
                            )
                        }
                        composable("settings") {
                            SettingsScreen(
                                wsManager = wsManager,
                                onBack = { navController.popBackStack() }
                            )
                        }
                    }
                }
            }
        }
    }

    override fun onDestroy() {
        wsManager.disconnect()
        super.onDestroy()
    }
}
