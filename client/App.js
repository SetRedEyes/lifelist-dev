import React from "react";
import { ApolloProvider } from "@apollo/client";
import { client } from "./index.js";
import AppNavigator from "./source/routes/AppNavigator";
import { AuthProvider } from "./source/contexts/AuthContext.js";
import { CreateProfileProvider } from "./source/contexts/CreateProfileContext.js";

export default function App() {
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
