// hooks/useCognitoAuth.ts
import { useState } from "react";
import { CognitoUser, AuthenticationDetails } from "amazon-cognito-identity-js";
import userPool from "../app/(tabs)/cognitoConfig";
import { Alert } from "react-native";

export const useCognitoAuth = () => {
  const [user, setUser] = useState<CognitoUser | null>(null);
  const [session, setSession] = useState<any>(null);
  const [sessionData, setSessionData] = useState<any>(null);
  const [authenticated, setAuthenticated] = useState(false);
  const [challenge, setChallenge] = useState(false);

  const initiateAuth = (phoneNumber: string, onFail: (msg: string) => void, onChallenge?: () => void) => {
    const authDetails = new AuthenticationDetails({ Username: phoneNumber });
    const cognitoUser = new CognitoUser({ Username: phoneNumber, Pool: userPool });

    cognitoUser.setAuthenticationFlowType("CUSTOM_AUTH");
    cognitoUser.initiateAuth(authDetails, {
      onSuccess: (session) => {
        setAuthenticated(true);
        setSessionData(session);
      },
      onFailure: (err) => onFail(err.message),
      //@ts-ignore
      customChallenge: (challengeParams, authSession) => {
        setUser(cognitoUser);
        setChallenge(true);
        setSession(authSession);
        onChallenge?.();

        if (challengeParams?.phoneNumber) {
            Alert.alert("OTP Sent", `OTP sent to ${challengeParams.phoneNumber}`);
        }
      },
    });
  };

  const sendOtp = (otp: string, onFail: (msg: string) => void) => {
    if (!user) return;
    user.sendCustomChallengeAnswer(otp, {
      onSuccess: (session) => {
        setAuthenticated(true);
        setSessionData(session);
      },
      onFailure: (err) => onFail(err.message),
      //@ts-ignore
      session,
    });
  };

  const logout = () => {
    user?.signOut?.();
    setUser(null);
    setChallenge(false);
    setAuthenticated(false);
    setSession(null);
    setSessionData(null);
  };

  return {
    authenticated,
    challenge,
    sessionData,
    initiateAuth,
    sendOtp,
    logout,
  };
};
