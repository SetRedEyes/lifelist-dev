import React, { useState, useEffect } from "react";
import {
  Text,
  View,
  Pressable,
  ActivityIndicator,
  FlatList,
  Dimensions,
  StyleSheet,
  SafeAreaView,
} from "react-native";
import { Image } from "expo-image";
import { useNavigation } from "@react-navigation/native";
import {
  LIKE_COLLAGE,
  UNLIKE_COLLAGE,
  REPOST_COLLAGE,
  UNREPOST_COLLAGE,
  SAVE_COLLAGE,
  UNSAVE_COLLAGE,
  ARCHIVE_COLLAGE,
  UNARCHIVE_COLLAGE,
  MARK_AND_GET_COLLAGE,
} from "../utils/mutations/collageActionMutations";
import { useMutation } from "@apollo/client";
import Comments from "../menus/collage/Comments";
import Participants from "../menus/collage/Participants";
import CollageButtonIcon from "../icons/CollageButtonIcon";
import { useAuth } from "../contexts/AuthContext";
import { useAdminProfile } from "../contexts/AdminProfileContext";
import AuthorCollageOptions from "../menus/collage/AuthorCollageOptions";
import DefaultCollageOptions from "../menus/collage/DefaultCollageOptions";
import { symbolStyles } from "../styles/components/symbolStyles";
import CollageButton from "../buttons/CollageButton";

const { width, height } = Dimensions.get("window");

export default function CollageDisplay({
  collageId,
  collages,
  currentIndex,
  isViewCollageScreen = false,
}) {
  const { currentUser } = useAuth();
  const { addRepost, removeRepost } = useAdminProfile();
  const navigation = useNavigation();

  // Mutation to mark collage as viewed and get its details
  const [markAndGetCollage, { loading, error, data }] = useMutation(
    MARK_AND_GET_COLLAGE,
    {
      variables: { collageId },
    }
  );

  const [showParticipants, setShowParticipants] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isReposted, setIsReposted] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isArchived, setIsArchived] = useState(false);

  // Trigger mutation on component mount
  useEffect(() => {
    if (collageId) {
      markAndGetCollage({ variables: { collageId } });
    }
  }, [collageId]);

  // Update state based on mutation data
  useEffect(() => {
    if (data) {
      const {
        collage,
        isLikedByCurrentUser,
        isRepostedByCurrentUser,
        isSavedByCurrentUser,
      } = data.markCollageViewedAndGetCollageById;

      setIsLiked(isLikedByCurrentUser);
      setIsReposted(isRepostedByCurrentUser);
      setIsSaved(isSavedByCurrentUser);
      setIsArchived(collage.archived);
    }
  }, [data]);

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

  const collageData = data?.markCollageViewedAndGetCollageById;

  if (!collageData) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

  const {
    collage,
    isLikedByCurrentUser,
    isRepostedByCurrentUser,
    isSavedByCurrentUser,
    hasParticipants,
  } = collageData;
  const { caption, images, author, createdAt } = collage;

  const handleProfilePress = () => {
    navigation.navigate("ProfileStack", {
      screen: "Profile",
      params: { userId: author._id },
    });
  };

  const renderItem = ({ item }) => (
    <Image
      style={styles.image}
      source={{
        uri: item,
      }}
    />
  );

  const handleScroll = (event) => {
    const index = Math.floor(event.nativeEvent.contentOffset.x / width);
  };

  const handleLikePress = async () => {
    if (isLiked) {
      await unlikeCollage({ variables: { collageId } });
    } else {
      await likeCollage({ variables: { collageId } });
    }
  };

  const handleRepostPress = async () => {
    try {
      if (isReposted) {
        const { data } = await unrepostCollage({ variables: { collageId } });
        if (data?.unrepostCollage?.success) {
          await removeRepost(collageId);
          setIsReposted(false);
        }
      } else {
        const { data } = await repostCollage({ variables: { collageId } });
        if (data?.repostCollage?.success) {
          const repost = {
            _id: data.repostCollage.collage._id,
            coverImage: data.repostCollage.collage.coverImage,
            createdAt: data.repostCollage.collage.createdAt,
          };
          await addRepost(repost);
          setIsReposted(true);
        }
      }
    } catch (error) {
      console.error("Error handling repost/unrepost:", error.message);
    }
  };

  const handleSavePress = async () => {
    if (isSaved) {
      await unsaveCollage({ variables: { collageId } });
    } else {
      await saveCollage({ variables: { collageId } });
    }
  };

  const handleArchivePress = async () => {
    if (isArchived) {
      await unarchiveCollage({ variables: { collageId } });
    } else {
      await archiveCollage({ variables: { collageId } });
    }
  };

  const handleOptionsPress = () => {
    setShowOptions(!showOptions);
  };

  return (
    <SafeAreaView style={styles.wrapper}>
      <View style={styles.imageContainer}>
        <FlatList
          data={images}
          renderItem={renderItem}
          horizontal
          pagingEnabled
          onScroll={handleScroll}
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
            onPress={handleOptionsPress}
          />
        </View>
      </View>
      <View style={styles.bottomContainer}>
        <View style={styles.captionContainer}>
          <Pressable onPress={handleProfilePress}>
            <Image
              style={styles.smallProfilePicture}
              source={{
                uri: author.profilePicture,
              }}
            />
          </Pressable>
          <Text style={styles.caption}>
            <Text onPress={handleProfilePress} style={styles.username}>
              {author.username}{" "}
            </Text>
            {caption}
          </Text>
        </View>
        <View style={styles.bottomTextContainer}>
          <CollageButton text={new Date(createdAt).toLocaleDateString()} />
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
      <Comments
        visible={showComments}
        onRequestClose={() => setShowComments(false)}
        collageId={collageId}
      />
      <Participants
        visible={showParticipants}
        onRequestClose={() => setShowParticipants(false)}
        collageId={collageId}
      />
      {currentUser === author._id ? (
        <AuthorCollageOptions
          visible={showOptions}
          onRequestClose={() => setShowOptions(false)}
          collageId={collageId}
          isArchived={isArchived}
          handleArchivePress={handleArchivePress}
          collageData={{
            caption,
            images,
            coverImage:
              data?.markCollageViewedAndGetCollageById?.collage.coverImage,
            taggedUsers:
              data?.markCollageViewedAndGetCollageById?.collage.tagged || [],
          }}
          collages={collages}
          currentIndex={currentIndex}
          isViewCollageScreen={isViewCollageScreen}
        />
      ) : (
        <DefaultCollageOptions
          visible={showOptions}
          onRequestClose={() => setShowOptions(false)}
          collageId={collageId}
          isSaved={isSaved}
          handleSavePress={handleSavePress}
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
    borderColor: "rgba(38, 40, 40, 0.3)",
    borderWidth: 2,
    marginRight: 8,
  },
  bottomTextContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
});
