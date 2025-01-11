import { gql } from "@apollo/client";

// === Mutation: Report Collage === //

export const REPORT_COLLAGE = gql`
  mutation ReportCollage($collageId: ID!, $reason: String!) {
    reportCollage(collageId: $collageId, reason: $reason) {
      success
      message
    }
  }
`;

// === Mutation: Report Comment === //

export const REPORT_COMMENT = gql`
  mutation ReportComment($commentId: ID!, $reason: String!) {
    reportComment(commentId: $commentId, reason: $reason) {
      success
      message
    }
  }
`;

// === Mutation: Report a Profile === //

export const REPORT_PROFILE = gql`
  mutation ReportProfile($profileId: ID!, $reason: String!) {
    reportProfile(profileId: $profileId, reason: $reason) {
      success
      message
    }
  }
`;

// === Mutation: Report a Moment === //

export const REPORT_MOMENT = gql`
  mutation ReportMoment($momentId: ID!, $reason: String!) {
    reportMoment(momentId: $momentId, reason: $reason) {
      success
      message
    }
  }
`;
