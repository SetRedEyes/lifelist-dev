import React, { useState } from "react";
import {
  Text,
  View,
  Pressable,
  FlatList,
  Dimensions,
  StyleSheet,
  SafeAreaView,
} from "react-native";
import { Image } from "expo-image";
import { useCreateCollageContext } from "../contexts/CreateCollageContext";
import Participants from "../menus/collage/Participants";
import Comments from "../menus/collage/Comments";
import CollageButtonIcon from "../icons/CollageButtonIcon";
import { symbolStyles } from "../styles/components/symbolStyles";

const { width } = Dimensions.get("window");

export default function CollagePreviewDisplay({
  userProfile,
  disabled = true,
}) {
  const { collage } = useCreateCollageContext();
  const { images, caption, coverImage, taggedUsers } = collage;

  const [showParticipants, setShowParticipants] = useState(false);
  const [showComments, setShowComments] = useState(false);

  // Render each image
  const renderItem = ({ item }) => (
    <Image style={styles.image} source={{ uri: item.image || item }} />
  );

  return (
    <SafeAreaView style={styles.wrapper}>
      {/* Image Section */}
      <View style={styles.imageContainer}>
        <FlatList
          data={images}
          renderItem={renderItem}
          horizontal
          pagingEnabled
          keyExtractor={(item, index) => index.toString()}
          showsHorizontalScrollIndicator={false}
        />

        {/* Action Buttons */}
        <View style={styles.actionContainer}>
          <CollageButtonIcon
            name="heart"
            style={symbolStyles.like}
            tintColor="#ffffff"
            onPress={() => {}}
            disabled={disabled}
          />
          <CollageButtonIcon
            name="arrow.2.squarepath"
            style={symbolStyles.repost}
            tintColor="#ffffff"
            onPress={() => {}}
            disabled={disabled}
          />
          <CollageButtonIcon
            name="text.bubble"
            style={symbolStyles.comment}
            tintColor="#ffffff"
            onPress={!disabled ? () => setShowComments(true) : null}
          />
          <CollageButtonIcon
            name="ellipsis"
            style={symbolStyles.ellipsis}
            tintColor="#ffffff"
            onPress={() => {}}
            disabled={disabled}
          />
        </View>
      </View>

      {/* Caption Section */}
      <View style={styles.bottomContainer}>
        <View style={styles.captionContainer}>
          <Image
            style={styles.smallProfilePicture}
            source={{
              uri: userProfile?.profilePicture,
            }}
          />
          <Text style={styles.caption}>
            <Text style={styles.username}>@{userProfile?.username} </Text>
            {caption}
          </Text>
        </View>

        {/* Participants & Comments Buttons */}
        <View style={styles.bottomTextContainer}>
          <View style={styles.dateButton}>
            <Text style={styles.dateButtonText}>
              {new Date().toLocaleDateString()}
            </Text>
          </View>
          <View style={{ flexDirection: "row" }}>
            <Pressable
              onPress={!disabled ? () => setShowComments(true) : null}
              disabled={disabled}
            >
              <View style={styles.commentsButton}>
                <Text style={styles.commentsButtonText}>Comments</Text>
              </View>
            </Pressable>
            {taggedUsers.length > 0 && (
              <Pressable onPress={() => setShowParticipants(true)}>
                <View style={[styles.participantsButton, { marginLeft: 8 }]}>
                  <Text style={styles.participantsButtonText}>
                    Participants
                  </Text>
                </View>
              </Pressable>
            )}
          </View>
        </View>
      </View>

      {/* Comments Popup */}
      {!disabled && (
        <Comments
          visible={showComments}
          onRequestClose={() => setShowComments(false)}
        />
      )}

      {/* Participants Popup */}
      <Participants
        visible={showParticipants}
        onRequestClose={() => setShowParticipants(false)}
        taggedUsers={taggedUsers}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: "#121212",
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
    marginRight: 8,
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
  dateButton: {
    backgroundColor: "#252525",
    borderRadius: 12,
    padding: 8,
  },
  dateButtonText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  commentsButton: {
    backgroundColor: "#252525",
    borderRadius: 12,
    padding: 8,
  },
  commentsButtonText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  participantsButton: {
    backgroundColor: "#252525",
    borderRadius: 12,
    padding: 8,
  },
  participantsButtonText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
});
