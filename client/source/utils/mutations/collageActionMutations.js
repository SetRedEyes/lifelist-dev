import { gql } from "@apollo/client";

// === Mutation: Get Collage by ID & Add to viewedCollages === //

export const MARK_AND_GET_COLLAGE = gql`
  mutation MarkCollageViewedAndGetCollageById($collageId: ID!) {
    markCollageViewedAndGetCollageById(collageId: $collageId) {
      collage {
        _id
        caption
        images
        coverImage
        author {
          _id
          username
          fullName
          profilePicture
          settings {
            isProfilePrivate
          }
        }
        createdAt
        archived
        tagged {
          _id
          username
          fullName
          profilePicture
        }
      }
      isLikedByCurrentUser
      isRepostedByCurrentUser
      isSavedByCurrentUser
      hasParticipants
    }
  }
`;

// === Mutation: Save Collage === //

export const SAVE_COLLAGE = gql`
  mutation SaveCollage($collageId: ID!) {
    saveCollage(collageId: $collageId) {
      success
      message
      action
    }
  }
`;

// === Mutation: Unsave Collage === //

export const UNSAVE_COLLAGE = gql`
  mutation UnsaveCollage($collageId: ID!) {
    unsaveCollage(collageId: $collageId) {
      success
      message
      action
    }
  }
`;

// === Mutation: Repost Collage === //

export const REPOST_COLLAGE = gql`
  mutation RepostCollage($collageId: ID!) {
    repostCollage(collageId: $collageId) {
      success
      message
      collage {
        _id
        coverImage
        createdAt
      }
    }
  }
`;

// === Mutation: Unrepost Collage === //

export const UNREPOST_COLLAGE = gql`
  mutation UnrepostCollage($collageId: ID!) {
    unrepostCollage(collageId: $collageId) {
      success
      message
      collageId
    }
  }
`;

// === Mutation: Like Collage === //

export const LIKE_COLLAGE = gql`
  mutation LikeCollage($collageId: ID!) {
    likeCollage(collageId: $collageId) {
      success
      message
      action
    }
  }
`;

// === Mutation: Unlike Collage === //

export const UNLIKE_COLLAGE = gql`
  mutation UnlikeCollage($collageId: ID!) {
    unlikeCollage(collageId: $collageId) {
      success
      message
      action
    }
  }
`;

// === Mutation: Archive Collage === //

export const ARCHIVE_COLLAGE = gql`
  mutation ArchiveCollage($collageId: ID!) {
    archiveCollage(collageId: $collageId) {
      success
      message
      collageId
    }
  }
`;

// === Mutation: Unarchive Collage === //

export const UNARCHIVE_COLLAGE = gql`
  mutation UnarchiveCollage($collageId: ID!) {
    unarchiveCollage(collageId: $collageId) {
      success
      message
      collage {
        _id
        coverImage
        createdAt
      }
    }
  }
`;

// === Mutation: Create Comment === //

export const CREATE_COMMENT = gql`
  mutation CreateComment($collageId: ID!, $text: String!) {
    createComment(collageId: $collageId, text: $text) {
      success
      message
      action
    }
  }
`;

// === Mutation: Edit Comment === //

export const EDIT_COMMENT = gql`
  mutation EditComment($commentId: ID!, $newText: String!) {
    editComment(commentId: $commentId, newText: $newText) {
      success
      message
      action
    }
  }
`;

// === Mutation: Delete Comment === //

export const DELETE_COMMENT = gql`
  mutation DeleteComment($collageId: ID!, $commentId: ID!) {
    deleteComment(collageId: $collageId, commentId: $commentId) {
      success
      message
      action
    }
  }
`;

// === Mutation: Delete Collage === //

export const DELETE_COLLAGE = gql`
  mutation DeleteCollage($collageId: ID!) {
    deleteCollage(collageId: $collageId) {
      success
      message
      collageId
    }
  }
`;

// === Mutation: Like Comment === //

export const LIKE_COMMENT = gql`
  mutation LikeComment($commentId: ID!) {
    likeComment(commentId: $commentId) {
      success
      message
      action
    }
  }
`;

// === Mutation: Unlike Comment === //

export const UNLIKE_COMMENT = gql`
  mutation UnlikeComment($commentId: ID!) {
    unlikeComment(commentId: $commentId) {
      success
      message
      action
    }
  }
`;
