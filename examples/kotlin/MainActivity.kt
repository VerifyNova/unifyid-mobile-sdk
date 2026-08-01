val unifyID = UnifyIDClient(
  UnifyIDConfig(
    clientId = BuildConfig.UNIFYID_CLIENT_ID,
    redirectUri = "https://mobile.example.com/oauth/callback",
    scopes = listOf("openid", "profile", "email", "identity_verified"),
    purpose = "Open your verified member account",
  ),
)
val transaction = unifyID.createTransaction()
// Persist the transaction in encrypted app storage, then:
unifyID.authorize(this, transaction)
