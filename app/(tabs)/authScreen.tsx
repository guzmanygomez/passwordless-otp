import React, { useState, useEffect } from "react";
import { View, Text, TextInput, Button, Alert, Linking, ScrollView } from "react-native";
import { CognitoUser, AuthenticationDetails } from "amazon-cognito-identity-js";
import userPool from "./cognitoConfig";

export default function AuthScreen() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [user, setUser] = useState(null);
  const [challenge, setChallenge] = useState(false);
  const [session, setSession] = useState(null);
  const [authenticated, setAuthenticated] = useState(false);
  const [sessionData, setSessionData] = useState(null);

  const initiateAuth = () => {
    if (!phoneNumber || phoneNumber.trim() === "") {
      Alert.alert("Error", "Enter a valid phone number.");
      return;
    }

    const authDetails = new AuthenticationDetails({
      Username: phoneNumber,
    });

    const cognitoUser = new CognitoUser({
      Username: phoneNumber,
      Pool: userPool,
    });

    cognitoUser.setAuthenticationFlowType("CUSTOM_AUTH");

    cognitoUser.initiateAuth(authDetails, {
      onSuccess: (session) => {
        Alert.alert("✅ Authentication successful!");
        console.log("✅ Authentication Session:", session);
        setAuthenticated(true);
        setSessionData(session);
      },
      onFailure: (err) => {
        Alert.alert("❌ Error", err.message);
        console.error("❌ Authentication Error:", err);
      },
      // @ts-ignore
      customChallenge: (challengeParameters: any, authSession: any) => {
        console.log("📩 Received Custom Challenge:", challengeParameters);
        setSession(authSession);

        if (challengeParameters?.phoneNumber) {
          Alert.alert("OTP Sent", `OTP sent to ${challengeParameters.phoneNumber}`);
        }

        setTimeout(() => {
          setUser(cognitoUser as any);
          setChallenge(true);
        }, 100);
      },
    });
  };

  const verifyOtp = () => {
    if (!otp || !user) {
      Alert.alert("Enter OTP");
      return;
    }

    // @ts-ignore
    user.sendCustomChallengeAnswer(otp, {
      onSuccess: (session: any) => {
        Alert.alert("✅ OTP Verified! Authentication Successful.");
        console.log("✅ Authentication Result:", session);
        setAuthenticated(true);
        setSessionData(session);
      },
      onFailure: (err: any) => {
        Alert.alert("❌ OTP Verification Failed", err.message);
        console.error("❌ OTP Error:", err);
      },
      challengeName: "CUSTOM_CHALLENGE",
      session: session,
    });
  };

  const logout = () => {
    if (user) {
      //@ts-ignore
      user.signOut();
    }
    setAuthenticated(false);
    setChallenge(false);
    setUser(null);
    setOtp("");
    setPhoneNumber("");
    setSession(null);
    setSessionData(null);
    Alert.alert("👋 Logged out successfully.");
  };

  useEffect(() => {
    const subscription = Linking.addEventListener("url", ({ url }) => {
      console.log("🔁 Got redirected back with URL:", url);
      // You can parse the token from here
    });

    return () => subscription.remove();
  }, []);

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: "center", padding: 20 }}>
      <Text style={{ fontSize: 24, marginBottom: 20 }}>Cognito Authentication</Text>

      {!authenticated && !challenge && (
        <>
          <TextInput
            placeholder="Enter phone number"
            style={{ borderBottomWidth: 1, marginBottom: 20, padding: 8 }}
            keyboardType="phone-pad"
            value={phoneNumber}
            onChangeText={setPhoneNumber}
          />
          <Button title="Send OTP" onPress={initiateAuth} />
        </>
      )}

      {challenge && !authenticated && (
        <>
          <TextInput
            placeholder="Enter OTP"
            style={{ borderBottomWidth: 1, marginBottom: 20, padding: 8, marginTop: 20 }}
            keyboardType="numeric"
            value={otp}
            onChangeText={setOtp}
          />
          <Button title="Verify OTP" onPress={verifyOtp} />
        </>
      )}

{authenticated && (
  <View style={{ marginTop: 30 }}>
    <Text style={{ fontSize: 18, fontWeight: "bold" }}>🎉 You are in!</Text>
    <View style={{ marginTop: 20 }}>
      <Button title="Logout" onPress={logout} />
    </View>
    <Text style={{ marginTop: 10 }}>Session Details:</Text>
    <Text selectable style={{ marginTop: 10 }}>
      {JSON.stringify(sessionData, null, 2)}
    </Text>
   
  </View>
)}
    </ScrollView>
  );
}
