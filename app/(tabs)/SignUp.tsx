import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  Alert,
  ScrollView,
} from "react-native";
import {
  CognitoUser,
  AuthenticationDetails,
  CognitoUserAttribute,
} from "amazon-cognito-identity-js";
import userPool from "./cognitoConfig";

export default function SignUpScreen() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [user, setUser] = useState<CognitoUser | null>(null);
  const [challenge, setChallenge] = useState(false);
  const [registered, setRegistered] = useState(false);
  const [session, setSession] = useState(null);
  const [sessionData, setSessionData] = useState(null);

  const initiateSignUp = () => {
    if (!phoneNumber || !email || !name) {
      Alert.alert("All fields are required.");
      return;
    }

    const attributeList = [
      new CognitoUserAttribute({ Name: "phone_number", Value: phoneNumber }),
      new CognitoUserAttribute({ Name: "email", Value: email }),
      new CognitoUserAttribute({ Name: "name", Value: name }),
    ];

    userPool.signUp(
      phoneNumber,
      "DummyPassword123!",
      attributeList,
      null,
      (err, result) => {
        if (err) {
          Alert.alert("❌ Sign-up failed", err.message);
          console.error("SignUp Error:", err);
          return;
        }

        const cognitoUser = result?.user;
        if (!cognitoUser) return;

        cognitoUser.setAuthenticationFlowType("CUSTOM_AUTH");

        const authDetails = new AuthenticationDetails({
          Username: phoneNumber,
        });

        cognitoUser.initiateAuth(authDetails, {
          onSuccess: (authSession) => {
            Alert.alert("✅ Registered and authenticated!");
            setRegistered(true);
            setSessionData(authSession);
          },
          onFailure: (err) => {
            Alert.alert("❌ Auth failed", err.message);
            console.error("Auth Error:", err);
          },
          customChallenge: (challengeParameters, authSession) => {
            console.log("📩 Custom Challenge Received", challengeParameters);
            setUser(cognitoUser);
            setSession(authSession);
            setChallenge(true);
          },
        });
      }
    );
  };

  const verifyOtp = () => {
    if (!otp || !user) {
      Alert.alert("Enter the OTP");
      return;
    }

    user.sendCustomChallengeAnswer(otp, {
      onSuccess: (authSession) => {
        Alert.alert("✅ OTP verified! Sign-up complete.");
        setRegistered(true);
        setSessionData(authSession);
      },
      onFailure: (err) => {
        Alert.alert("❌ OTP verification failed", err.message);
        console.error("OTP Error:", err);
      },
      session,
    });
  };

  const logout = () => {
    if (user) {
      user.signOut();
    }
    setRegistered(false);
    setUser(null);
    setChallenge(false);
    setPhoneNumber("");
    setOtp("");
    setSession(null);
    setSessionData(null);
    setName("");
    setEmail("");
    Alert.alert("👋 Logged out successfully");
  };

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: "center", padding: 20 }}>
      <Text style={{ fontSize: 24, fontWeight: "bold", marginBottom: 20 }}>Sign Up</Text>

      {!registered && !challenge && (
        <>
          <TextInput
            placeholder="Full Name"
            value={name}
            onChangeText={setName}
            style={{ borderBottomWidth: 1, marginBottom: 15, padding: 8 }}
          />
          <TextInput
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            style={{ borderBottomWidth: 1, marginBottom: 15, padding: 8 }}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TextInput
            placeholder="Phone Number (e.g. +614...)"
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            style={{ borderBottomWidth: 1, marginBottom: 15, padding: 8 }}
            keyboardType="phone-pad"
          />
          <Button title="Register & Send OTP" onPress={initiateSignUp} />
        </>
      )}

      {challenge && !registered && (
        <>
          <TextInput
            placeholder="Enter OTP"
            value={otp}
            onChangeText={setOtp}
            style={{ borderBottomWidth: 1, marginVertical: 20, padding: 8 }}
            keyboardType="numeric"
          />
          <Button title="Verify OTP" onPress={verifyOtp} />
        </>
      )}

      {registered && (
        <View style={{ marginTop: 30 }}>
          <Text style={{ fontSize: 18 }}>🎉 Registration Complete!</Text>
          <Text style={{ marginTop: 10 }}>Session Info:</Text>
          <Text selectable style={{ marginTop: 10 }}>
            {JSON.stringify(sessionData, null, 2)}
          </Text>
          <View style={{ marginTop: 20 }}>
            <Button title="Logout" onPress={logout} />
          </View>
        </View>
      )}
    </ScrollView>
  );
}
