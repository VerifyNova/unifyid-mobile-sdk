const session = await continueWithUnifyID({
  clientId: Config.UNIFYID_CLIENT_ID,
  redirectUrl: "https://mobile.example.com/oauth/callback",
  scopes: ["openid", "profile", "email", "identity_verified"],
});
