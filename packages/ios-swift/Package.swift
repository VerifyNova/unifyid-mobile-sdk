// swift-tools-version: 5.9
import PackageDescription

let package = Package(
  name: "UnifyID",
  platforms: [.iOS(.v15), .macOS(.v12)],
  products: [.library(name: "UnifyID", targets: ["UnifyID"])],
  targets: [.target(name: "UnifyID")]
)

