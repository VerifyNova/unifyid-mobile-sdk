import AuthenticationServices
import CryptoKit
import Foundation

public struct UnifyIDConfiguration {
  public let clientId: String
  public let redirectURI: URL
  public let scopes: [String]
  public let authorizeURL: URL
  public let tokenURL: URL

  public init(clientId: String, redirectURI: URL, scopes: [String],
              authorizeURL: URL = URL(string: "http://localhost:3000/v1/oauth/authorize")!,
              tokenURL: URL = URL(string: "http://localhost:3000/v1/oauth/token")!) {
    self.clientId = clientId
    self.redirectURI = redirectURI
    self.scopes = scopes
    self.authorizeURL = authorizeURL
    self.tokenURL = tokenURL
  }
}

public struct UnifyIDAuthorizationResult {
  public let callbackURL: URL
  public let codeVerifier: String
  public let nonce: String
}

@MainActor
public final class UnifyIDClient: NSObject {
  private let configuration: UnifyIDConfiguration
  private var session: ASWebAuthenticationSession?

  public init(configuration: UnifyIDConfiguration) { self.configuration = configuration }

  public func authorize(anchor: ASPresentationAnchor) async throws -> UnifyIDAuthorizationResult {
    let verifier = Self.random(64)
    let challenge = Data(SHA256.hash(data: Data(verifier.utf8))).base64URLEncodedString()
    let state = Self.random(32)
    let nonce = Self.random(32)
    var parts = URLComponents(url: configuration.authorizeURL, resolvingAgainstBaseURL: false)!
    parts.queryItems = [
      .init(name: "response_type", value: "code"),
      .init(name: "client_id", value: configuration.clientId),
      .init(name: "redirect_uri", value: configuration.redirectURI.absoluteString),
      .init(name: "scope", value: configuration.scopes.joined(separator: " ")),
      .init(name: "state", value: state),
      .init(name: "nonce", value: nonce),
      .init(name: "code_challenge", value: challenge),
      .init(name: "code_challenge_method", value: "S256"),
    ]
    return try await withCheckedThrowingContinuation { continuation in
      let callback = configuration.redirectURI.scheme == "https"
        ? ASWebAuthenticationSession.Callback.https(
            host: configuration.redirectURI.host!,
            path: configuration.redirectURI.path
          )
        : ASWebAuthenticationSession.Callback.customScheme(configuration.redirectURI.scheme!)
      session = ASWebAuthenticationSession(url: parts.url!, callback: callback) { url, error in
        if let error { continuation.resume(throwing: error); return }
        guard let url,
              URLComponents(url: url, resolvingAgainstBaseURL: false)?
                .queryItems?.first(where: { $0.name == "state" })?.value == state
        else { continuation.resume(throwing: URLError(.userAuthenticationRequired)); return }
        continuation.resume(returning: UnifyIDAuthorizationResult(
          callbackURL: url,
          codeVerifier: verifier,
          nonce: nonce
        ))
      }
      self.session?.presentationContextProvider = AnchorProvider(anchor)
      self.session?.start()
    }
  }

  public func exchange(code: String, verifier: String) async throws -> Data {
    var request = URLRequest(url: configuration.tokenURL)
    request.httpMethod = "POST"
    request.setValue("application/x-www-form-urlencoded", forHTTPHeaderField: "Content-Type")
    let fields = [
      "grant_type": "authorization_code",
      "client_id": configuration.clientId,
      "redirect_uri": configuration.redirectURI.absoluteString,
      "code": code,
      "code_verifier": verifier,
    ]
    request.httpBody = fields.map {
      "\($0.key.addingPercentEncoding(withAllowedCharacters: .urlQueryAllowed)!)=\($0.value.addingPercentEncoding(withAllowedCharacters: .urlQueryAllowed)!)"
    }.joined(separator: "&").data(using: .utf8)
    let (data, response) = try await URLSession.shared.data(for: request)
    guard (response as? HTTPURLResponse)?.statusCode == 200 else {
      throw URLError(.userAuthenticationRequired)
    }
    return data
  }

  private static func random(_ count: Int) -> String {
    var bytes = [UInt8](repeating: 0, count: count)
    _ = SecRandomCopyBytes(kSecRandomDefault, bytes.count, &bytes)
    return Data(bytes).base64URLEncodedString()
  }
}

private final class AnchorProvider: NSObject, ASWebAuthenticationPresentationContextProviding {
  let anchor: ASPresentationAnchor
  init(_ anchor: ASPresentationAnchor) { self.anchor = anchor }
  func presentationAnchor(for session: ASWebAuthenticationSession) -> ASPresentationAnchor { anchor }
}

private extension Data {
  func base64URLEncodedString() -> String {
    base64EncodedString().replacingOccurrences(of: "+", with: "-")
      .replacingOccurrences(of: "/", with: "_")
      .replacingOccurrences(of: "=", with: "")
  }
}
