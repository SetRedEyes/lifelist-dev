import { gql } from "@apollo/client";

// === Mutation: Update User Data === //

export const UPDATE_USER_DATA = gql`
  mutation UpdateUserData(
    $email: String
    $phoneNumber: String
    $profilePicture: Upload
    $fullName: String
    $username: String
    $bio: String
    $gender: String
    $birthday: String
    $isProfilePrivate: Boolean
    $darkMode: Boolean
    $language: String
    $notifications: Boolean
    $postRepostToMainFeed: Boolean
  ) {
    updateUserData(
      email: $email
      phoneNumber: $phoneNumber
      profilePicture: $profilePicture
      fullName: $fullName
      username: $username
      bio: $bio
      gender: $gender
      birthday: $birthday
      isProfilePrivate: $isProfilePrivate
      darkMode: $darkMode
      language: $language
      notifications: $notifications
      postRepostToMainFeed: $postRepostToMainFeed
    ) {
      success
      message
      user {
        profilePicture
        fullName
        username
        bio
        birthday
        gender
        email
        phoneNumber
        settings {
          isProfilePrivate
          darkMode
          language
          notifications
          postRepostToMainFeed
        }
      }
    }
  }
`;

// === Mutation: Delete a User === //

export const DELETE_USER = gql`
  mutation DeleteUser($userId: ID!) {
    deleteUser(userId: $userId) {
      success
      message
    }
  }
`;

// === Mutation: Update Password === //

export const UPDATE_PASSWORD = gql`
  mutation UpdatePassword($currentPassword: String!, $newPassword: String!) {
    updatePassword(
      currentPassword: $currentPassword
      newPassword: $newPassword
    ) {
      success
      message
    }
  }
`;
