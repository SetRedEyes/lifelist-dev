import { gql } from "@apollo/client";

export const CHECK_ONBOARDING_STATUS = gql`
  query CheckOnboardingStatus {
    checkOnboardingStatus
  }
`;
