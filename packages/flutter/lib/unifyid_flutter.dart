import 'package:flutter_appauth/flutter_appauth.dart';

class UnifyIDConfig {
  const UnifyIDConfig({
    required this.clientId,
    required this.redirectUrl,
    required this.scopes,
    this.discoveryUrl,
  });
  final String clientId;
  final String redirectUrl;
  final List<String> scopes;
  final String? discoveryUrl;
}

class UnifyID {
  UnifyID(this.config, {FlutterAppAuth? appAuth})
      : _appAuth = appAuth ?? const FlutterAppAuth();
  final UnifyIDConfig config;
  final FlutterAppAuth _appAuth;

  Future<AuthorizationTokenResponse?> authorize() => _appAuth.authorizeAndExchangeCode(
        AuthorizationTokenRequest(
          config.clientId,
          config.redirectUrl,
          serviceConfiguration: const AuthorizationServiceConfiguration(
            authorizationEndpoint: 'http://localhost:3000/v1/oauth/authorize',
            tokenEndpoint: 'http://localhost:3000/v1/oauth/token',
          ),
          scopes: config.scopes,
        ),
      );
}
