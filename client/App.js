import React, { useEffect } from "react";
import { ApolloProvider } from "@apollo/client";
import { client } from "./index.js";
import AppNavigator from "./source/routes/AppNavigator";
import { AuthProvider } from "./source/contexts/AuthContext.js";
import { CreateProfileProvider } from "./source/contexts/CreateProfileContext.js";

/* import { Amplify } from "aws-amplify";
import { signUp } from "aws-amplify/auth";
import awsExports from "./aws-exports"; // Adjust the path to your aws-exports.js

// Configure Amplify with Cognito
Amplify.configure(awsExports);

async function signUpProcess() {
  console.log("Amplify is configured. Starting sign-up process...");
  try {
    const user = await signUp({
      username: "+19377266082", // Use phone number or email based on your setup
      password: "Password1!", // Must meet your Cognito policy
      attributes: {
        email: "testuser@example.com", // Optional (only if email is required)
      },
    });
    console.log("Sign-up successful:", user);
  } catch (error) {
    console.error("Sign-up error:", error);
  }
} */

export default function App() {
  /*   useEffect(() => {
    console.log("Amplify has been configured:", awsExports);
    signUpProcess();
  }, []); */

  return (
    <ApolloProvider client={client}>
      <AuthProvider>
        <CreateProfileProvider>
          <AppNavigator />
        </CreateProfileProvider>
      </AuthProvider>
    </ApolloProvider>
  );
}
