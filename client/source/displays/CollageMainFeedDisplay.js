import React, { useState } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  Dimensions,
  Text,
  Pressable,
  SafeAreaView,
} from "react-native";
import { Image } from "expo-image";
import { useNavigation } from "@react-navigation/native";
import { useMutation } from "@apollo/client";
import {
  LIKE_COLLAGE,
  UNLIKE_COLLAGE,
  REPOST_COLLAGE,
  UNREPOST_COLLAGE,
  SAVE_COLLAGE,
  UNSAVE_COLLAGE,
  ARCHIVE_COLLAGE,
  UNARCHIVE_COLLAGE,
} from "../utils/mutations/collageActionMutations";
import Comments from "../menus/collage/Comments";
import Participants from "../menus/collage/Participants";
import AuthorCollageOptions from "../menus/collage/AuthorCollageOptions";
import DefaultCollageOptions from "../menus/collage/DefaultCollageOptions";
import CollageButtonIcon from "../icons/CollageButtonIcon";
import { symbolStyles } from "../styles/components/symbolStyles";
import CollageButton from "../buttons/CollageButton";

const { width } = Dimensions.get("window");

export default function CollageMainFeedDisplay({
  collage,
  hasParticipants,
  isAuthor,
  collages,
  currentIndex,
}) {
  const navigation = useNavigation();
  const [showComments, setShowComments] = useState(false);
  const [showParticipants, setShowParticipants] = useState(false);
  const [showOptions, setShowOptions] = useState(false);

  const [isLiked, setIsLiked] = useState(collage.isLikedByCurrentUser);
  const [isReposted, setIsReposted] = useState(collage.isRepostedByCurrentUser);
  const [isSaved, setIsSaved] = useState(collage.isSavedByCurrentUser);
  const [isArchived, setIsArchived] = useState(collage.isArchived);

  // Mutations
  const [likeCollage] = useMutation(LIKE_COLLAGE, {
    onCompleted: () => setIsLiked(true),
  });
  const [unlikeCollage] = useMutation(UNLIKE_COLLAGE, {
    onCompleted: () => setIsLiked(false),
  });
  const [repostCollage] = useMutation(REPOST_COLLAGE, {
    onCompleted: () => setIsReposted(true),
  });
  const [unrepostCollage] = useMutation(UNREPOST_COLLAGE, {
    onCompleted: () => setIsReposted(false),
  });
  const [saveCollage] = useMutation(SAVE_COLLAGE, {
    onCompleted: () => setIsSaved(true),
  });
  const [unsaveCollage] = useMutation(UNSAVE_COLLAGE, {
    onCompleted: () => setIsSaved(false),
  });
  const [archiveCollage] = useMutation(ARCHIVE_COLLAGE, {
    onCompleted: () => setIsArchived(true),
  });
  const [unarchiveCollage] = useMutation(UNARCHIVE_COLLAGE, {
    onCompleted: () => setIsArchived(false),
  });

  // Handlers
  const handleLikePress = async () => {
    try {
      if (isLiked) {
        await unlikeCollage({ variables: { collageId: collage._id } });
      } else {
        await likeCollage({ variables: { collageId: collage._id } });
      }
    } catch (error) {
      console.error("Error liking/unliking collage:", error.message);
    }
  };

  const handleRepostPress = async () => {
    try {
      if (isReposted) {
        await unrepostCollage({ variables: { collageId: collage._id } });
      } else {
        await repostCollage({ variables: { collageId: collage._id } });
      }
    } catch (error) {
      console.error("Error reposting/unreposting collage:", error.message);
    }
  };

  const handleSavePress = async () => {
    try {
      if (isSaved) {
        await unsaveCollage({ variables: { collageId: collage._id } });
      } else {
        await saveCollage({ variables: { collageId: collage._id } });
      }
    } catch (error) {
      console.error("Error saving/unsaving collage:", error.message);
    }
  };

  const handleArchivePress = async () => {
    try {
      if (isArchived) {
        await unarchiveCollage({ variables: { collageId: collage._id } });
      } else {
        await archiveCollage({ variables: { collageId: collage._id } });
      }
    } catch (error) {
      console.error("Error archiving/unarchiving collage:", error.message);
    }
  };

  const renderImage = ({ item }) => (
    <Image style={styles.image} source={{ uri: item }} />
  );

  const handleProfilePress = () => {
    navigation.navigate("ProfileStack", {
      screen: "Profile",
      params: { userId: collage.author._id },
    });
  };

  return (
    <SafeAreaView style={styles.wrapper}>
      <View style={styles.imageContainer}>
        <FlatList
          data={collage.images}
          renderItem={renderImage}
          horizontal
          pagingEnabled
          keyExtractor={(item, index) => index.toString()}
          showsHorizontalScrollIndicator={false}
        />
        <View style={styles.actionContainer}>
          <CollageButtonIcon
            name={isLiked ? "heart.fill" : "heart"}
            style={symbolStyles.like}
            tintColor={isLiked ? "#ff0000" : "#ffffff"}
            onPress={handleLikePress}
          />
          <CollageButtonIcon
            name="arrow.2.squarepath"
            style={symbolStyles.repost}
            tintColor={isReposted ? "#6AB952" : "#ffffff"}
            onPress={handleRepostPress}
          />
          <CollageButtonIcon
            name="text.bubble"
            style={symbolStyles.comment}
            tintColor="#ffffff"
            onPress={() => setShowComments(true)}
          />
          <CollageButtonIcon
            name="ellipsis"
            style={symbolStyles.ellipsis}
            tintColor="#ffffff"
            onPress={() => setShowOptions(true)}
          />
        </View>
      </View>
      <View style={styles.bottomContainer}>
        <View style={styles.captionContainer}>
          <Pressable onPress={handleProfilePress}>
            <Image
              style={styles.smallProfilePicture}
              source={{ uri: collage.author.profilePicture }}
            />
          </Pressable>
          <Text style={styles.caption}>
            <Text style={styles.username}>{collage.author.username} </Text>
            {collage.caption}
          </Text>
        </View>
        <View style={styles.bottomTextContainer}>
          <CollageButton
            text={new Date(collage.createdAt).toLocaleDateString()}
          />
          <View style={{ flexDirection: "row" }}>
            <CollageButton
              text={"Comments"}
              onPress={() => setShowComments(true)}
            />
            {hasParticipants && (
              <View style={{ marginLeft: 8 }}>
                <CollageButton
                  text={"Participants"}
                  onPress={() => setShowParticipants(true)}
                />
              </View>
            )}
          </View>
        </View>
      </View>
      {/* Modals */}
      <Comments
        visible={showComments}
        onRequestClose={() => setShowComments(false)}
        collageId={collage._id}
      />
      <Participants
        visible={showParticipants}
        onRequestClose={() => setShowParticipants(false)}
        collageId={collage._id}
      />
      {isAuthor ? (
        <AuthorCollageOptions
          visible={showOptions}
          collage={collage}
          collageId={collage._id}
          collages={collages}
          currentIndex={currentIndex}
          onRequestClose={() => setShowOptions(false)}
          isArchived={isArchived}
          handleArchivePress={handleArchivePress}
        />
      ) : (
        <DefaultCollageOptions
          visible={showOptions}
          onRequestClose={() => setShowOptions(false)}
          collageId={collage._id}
          isSaved={isSaved}
          onSavePress={handleSavePress}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
  imageContainer: {
    position: "relative",
  },
  image: {
    width: width,
    height: width * (3 / 2),
  },
  actionContainer: {
    position: "absolute",
    bottom: 12,
    right: 12,
    flexDirection: "column",
    alignItems: "center",
  },
  bottomContainer: {
    flex: 1,
    marginTop: 8,
    paddingHorizontal: 12,
    justifyContent: "space-between",
  },
  captionContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  caption: {
    color: "#fff",
    flexShrink: 1,
    flexWrap: "wrap",
  },
  username: {
    fontWeight: "bold",
    color: "#fff",
  },
  smallProfilePicture: {
    height: 35,
    width: 35,
    borderRadius: 4,
    marginRight: 8,
  },
  bottomTextContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
});
