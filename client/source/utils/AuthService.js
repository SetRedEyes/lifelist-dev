import * as SecureStore from "expo-secure-store";
import { jwtDecode } from "jwt-decode";
import { decode as atob } from "base-64";
import { signInWithPhoneNumber } from "firebase/auth";
import { auth } from "./firebaseConfig";

global.atob = atob;

class AuthService {
  // Store the token upon login
  async saveToken(token) {
    await SecureStore.setItemAsync("authToken", token);
  }

  // Retrieve the token from storage
  async getToken() {
    const token = await SecureStore.getItemAsync("authToken");
    return token;
  }

  // Remove the token and handle logout
  async logout() {
    console.log("Logging out, clearing token...");
    await SecureStore.deleteItemAsync("authToken");
  }

  // Check if the user is logged in by checking the token existence and its expiration
  async loggedIn() {
    const token = await this.getToken();
    if (!token) return false;
    return !(await this.isTokenExpired(token));
  }

  // Decode the token to get user data
  async getUser() {
    const token = await this.getToken();
    const decoded = token ? jwtDecode(token) : null;
    return decoded ? decoded.id : null;
  }

  // Check if the token is expired
  async isTokenExpired(token) {
    try {
      const decoded = jwtDecode(token);
      return decoded.exp < Date.now() / 1000;
    } catch (error) {
      console.error("Failed to decode token", error);
      return true;
    }
  }

  async saveRegistrationProgress(progress) {
    await SecureStore.setItemAsync("registrationProgress", progress);
  }

  async getRegistrationProgress() {
    return await SecureStore.getItemAsync("registrationProgress");
  }

  async setRegistrationComplete() {
    try {
      await SecureStore.setItemAsync("registrationProgress", "Complete");
    } catch (error) {
      console.error("Error setting registration as complete", error);
    }
  }

  async isRegistrationComplete() {
    try {
      const progress = await this.getRegistrationProgress();
      return progress === "Complete";
    } catch (error) {
      console.error("Error checking registration completion", error);
      return false;
    }
  }

  // Send the phone verification code
  async sendVerificationCode(phoneNumber) {
    try {
      const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber);
      console.log("Verification code sent!");
      return confirmationResult; // Return confirmation result for later verification
    } catch (error) {
      console.error("Error sending verification code:", error);
      throw error;
    }
  }

  // Confirm the verification code and sign in the user
  async confirmVerificationCode(confirmationResult, code) {
    try {
      const result = await confirmationResult.confirm(code);
      console.log("Phone number verified!");
      // Save the user's authentication token after verification
      const token = await result.user.getIdToken();
      await this.saveToken(token);
      return result.user;
    } catch (error) {
      console.error("Error confirming verification code:", error);
      throw error;
    }
  }
}

export default new AuthService();
