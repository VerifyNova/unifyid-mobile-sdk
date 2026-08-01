package com.unifyid.sdk

import android.app.Activity
import android.content.Intent
import android.net.Uri
import androidx.browser.customtabs.CustomTabsIntent
import java.security.MessageDigest
import java.security.SecureRandom
import java.util.Base64
import okhttp3.FormBody
import okhttp3.OkHttpClient
import okhttp3.Request

data class UnifyIDConfig(
  val clientId: String,
  val redirectUri: String,
  val scopes: List<String>,
  val purpose: String? = null,
  val authorizeUrl: String = "http://10.0.2.2:3000/v1/oauth/authorize",
  val tokenUrl: String = "http://10.0.2.2:3000/v1/oauth/token",
)

data class UnifyIDTransaction(
  val state: String,
  val nonce: String,
  val codeVerifier: String,
  val authorizationUrl: Uri,
  val createdAt: Long = System.currentTimeMillis(),
)

class UnifyIDClient(private val config: UnifyIDConfig) {
  private val http = OkHttpClient()
  private fun random(size: Int): String {
    val value = ByteArray(size).also(SecureRandom()::nextBytes)
    return Base64.getUrlEncoder().withoutPadding().encodeToString(value)
  }

  fun createTransaction(): UnifyIDTransaction {
    val state = random(32)
    val nonce = random(32)
    val verifier = random(64)
    val challenge = Base64.getUrlEncoder().withoutPadding()
      .encodeToString(MessageDigest.getInstance("SHA-256").digest(verifier.toByteArray()))
    val url = Uri.parse(config.authorizeUrl).buildUpon()
      .appendQueryParameter("response_type", "code")
      .appendQueryParameter("client_id", config.clientId)
      .appendQueryParameter("redirect_uri", config.redirectUri)
      .appendQueryParameter("scope", config.scopes.joinToString(" "))
      .appendQueryParameter("state", state)
      .appendQueryParameter("nonce", nonce)
      .appendQueryParameter("code_challenge", challenge)
      .appendQueryParameter("code_challenge_method", "S256")
      .apply { config.purpose?.let { appendQueryParameter("purpose", it) } }
      .build()
    return UnifyIDTransaction(state, nonce, verifier, url)
  }

  fun authorize(activity: Activity, transaction: UnifyIDTransaction) {
    CustomTabsIntent.Builder().setShowTitle(true).build().launchUrl(activity, transaction.authorizationUrl)
  }

  fun complete(callback: Intent, transaction: UnifyIDTransaction): String {
    require(System.currentTimeMillis() - transaction.createdAt < 600_000) { "Transaction expired." }
    val uri = requireNotNull(callback.data) { "Missing callback URI." }
    require(uri.getQueryParameter("state") == transaction.state) { "State mismatch." }
    uri.getQueryParameter("error")?.let { throw IllegalStateException(it) }
    return requireNotNull(uri.getQueryParameter("code")) { "Missing authorization code." }
  }

  fun exchange(code: String, transaction: UnifyIDTransaction): String {
    val body = FormBody.Builder()
      .add("grant_type", "authorization_code")
      .add("client_id", config.clientId)
      .add("redirect_uri", config.redirectUri)
      .add("code", code)
      .add("code_verifier", transaction.codeVerifier)
      .build()
    http.newCall(Request.Builder().url(config.tokenUrl).post(body).build()).execute().use {
      require(it.isSuccessful) { "Token exchange failed." }
      return requireNotNull(it.body).string()
    }
  }
}
