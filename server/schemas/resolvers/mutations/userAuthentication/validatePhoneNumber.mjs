import { isPhoneNumberAvailable } from "../../../../utils/validation.mjs";

export const validatePhoneNumber = async (_, { phoneNumber }) => {
  if (!phoneNumber) {
    throw new Error("Please provide a phone number.");
  }

  // Check if the phone number is available
  await isPhoneNumberAvailable(phoneNumber);

  return {
    success: true,
    message: "Phone number validated successfully.",
  };
};
