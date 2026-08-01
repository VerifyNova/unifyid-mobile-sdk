final unifyID = UnifyID(const UnifyIDConfig(
  clientId: String.fromEnvironment('UNIFYID_CLIENT_ID'),
  redirectUrl: 'https://mobile.example.com/oauth/callback',
  scopes: ['openid', 'profile', 'email', 'identity_verified'],
));
final authorization = await unifyID.authorize();
