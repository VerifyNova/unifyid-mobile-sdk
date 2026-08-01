import { authorize } from "react-native-app-auth";

export const continueWithUnifyID = ({
  clientId,
  redirectUrl,
  scopes = ["openid", "profile"],
  apiBaseUrl = "http://localhost:3000",
}) =>
  authorize({
    clientId,
    redirectUrl,
    scopes,
    serviceConfiguration: {
      authorizationEndpoint: `${apiBaseUrl}/v1/oauth/authorize`,
      tokenEndpoint: `${apiBaseUrl}/v1/oauth/token`,
    },
    usePKCE: true,
    skipCodeExchange: false,
  });

