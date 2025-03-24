import { useCognitoAuth } from "@/hooks/useCognitoAuth";
import uuid from 'react-native-uuid';
import { CognitoUserAttribute } from "amazon-cognito-identity-js";
import React, { useState } from "react";
import { Alert, Button, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import userPool from "./(tabs)/cognitoConfig";

export default function AuthScreen() {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");

  const {
    authenticated,
    challenge,
    sessionData,
    initiateAuth,
    sendOtp,
    logout
  } = useCognitoAuth();

  const clearFields = () => {
    setName("");
    setEmail("");
    setPhoneNumber("");
    setOtp("");
  };

  const startSignUp = () => {
    if (!name || !email || !phoneNumber) {
      Alert.alert("All fields are required.");
      return;
    }
  
    const username = uuid.v4(); // <- this must NOT be an email or phone
  
    const attributes = [
      new CognitoUserAttribute({ Name: "name", Value: name }),
      new CognitoUserAttribute({ Name: "email", Value: email }),
      new CognitoUserAttribute({ Name: "phone_number", Value: phoneNumber })
    ];
  
    //@ts-ignore
    userPool.signUp(username, "DummyPassword123!", attributes, null, (err, result) => {
      if (err) {
        Alert.alert("❌ Sign-up error", err.message);
        return;
      }
  
      // ✅ Use alias (phoneNumber or email) to sign in
      initiateAuth(phoneNumber, (msg) => Alert.alert("Auth failed", msg));
    });
  }; 

  const startSignIn = () => {
    if (!phoneNumber) {
      Alert.alert("Please enter phone number.");
      return;
    }
    initiateAuth(phoneNumber, (msg) => Alert.alert("Auth failed", msg));
  };

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: "center", padding: 20 }}>
      <Text style={{ fontSize: 24, marginBottom: 20 }}>
        {mode === "signin" ? "Sign In" : "Sign Up"}
      </Text>

      {!authenticated && !challenge && (
        <>
          {mode === "signup" && (
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
              />
            </>
          )}
          <TextInput
            placeholder="Phone Number (e.g. +614...)"
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            style={{ borderBottomWidth: 1, marginBottom: 15, padding: 8 }}
            keyboardType="phone-pad"
          />

          <Button
            title={mode === "signin" ? "Send OTP" : "Register & Send OTP"}
            onPress={mode === "signin" ? startSignIn : startSignUp}
          />
          <TouchableOpacity onPress={() => setMode(mode === "signin" ? "signup" : "signin")}>
            <Text style={{ marginTop: 20, color: "blue" }}>
              {mode === "signin" ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
            </Text>
          </TouchableOpacity>
        </>
      )}

      {challenge && !authenticated && (
        <>
          <TextInput
            placeholder="Enter OTP"
            value={otp}
            onChangeText={setOtp}
            style={{ borderBottomWidth: 1, marginVertical: 20, padding: 8 }}
            keyboardType="numeric"
          />
          <Button
            title="Verify OTP"
            onPress={() =>
              //@ts-ignore
              sendOtp(otp, (msg) => Alert.alert("OTP Failed", msg), () => clearFields())
            }
          />
        </>
      )}

      {authenticated && (
        <View style={{ marginTop: 30 }}>
          <Text style={{ fontSize: 18 }}>🎉 Authenticated!</Text>
          <Text style={{ marginTop: 10 }}>Session Info:</Text>
          <Text selectable style={{ marginTop: 10 }}>{JSON.stringify(sessionData, null, 2)}</Text>
          <View style={{ marginTop: 20 }}>
            <Button
              title="Logout"
              onPress={() => {
                logout();
                clearFields();
              }}
            />
          </View>
        </View>
      )}
    </ScrollView>
  );
}
