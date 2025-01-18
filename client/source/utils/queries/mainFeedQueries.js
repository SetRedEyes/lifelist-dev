import { gql } from "@apollo/client";

// === Query: Get Main Feed === //

export const GET_MAIN_FEED = gql`
  query GetMainFeed($limit: Int, $cursor: String) {
    getMainFeed(limit: $limit, cursor: $cursor) {
      collages {
        _id
        images
        coverImage
        caption
        createdAt
        author {
          _id
          username
          fullName
          profilePicture
        }
        likes {
          _id
        }
        reposts {
          _id
        }
        saves {
          _id
        }
        tagged {
          _id
          username
          fullName
          profilePicture
        }
        isLikedByCurrentUser
        isRepostedByCurrentUser
        isSavedByCurrentUser
        hasParticipants
      }
      nextCursor
      hasNextPage
    }
  }
`;
