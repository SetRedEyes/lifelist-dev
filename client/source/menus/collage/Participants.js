import React, { useCallback } from "react";
import { Text, View, FlatList, Dimensions } from "react-native";
import { useQuery } from "@apollo/client";
import { useFocusEffect } from "@react-navigation/native";
import { GET_TAGGED_USERS } from "../../utils/queries/collageQueries";
import ParticipantCard from "../../cards/collage/ParticipantCard";
import { menuStyles } from "../../styles/components/menuStyles";
import BottomPopup from "../BottomPopup";

export default function Participants({
  visible,
  onRequestClose,
  collageId,
  taggedUsers = [],
}) {
  // Use the query only if taggedUsers is not provided
  const { data, loading, error, refetch } = useQuery(GET_TAGGED_USERS, {
    variables: { collageId },
    skip: !visible || taggedUsers.length > 0,
  });

  useFocusEffect(
    useCallback(() => {
      if (visible && taggedUsers.length === 0) {
        refetch();
      }
    }, [visible, refetch, taggedUsers.length])
  );

  // Decide which data source to use
  const participants =
    taggedUsers.length > 0 ? taggedUsers : data?.getTaggedUsers || [];

  return (
    <BottomPopup
      visible={visible}
      onRequestClose={onRequestClose}
      initialHeight={Dimensions.get("window").height * 0.6}
      draggableHeader={
        <Text style={menuStyles.draggableHeader}>Participants</Text>
      }
    >
      <View style={menuStyles.nonDraggableContent}>
        <View style={menuStyles.dynamicPopupContainer}>
          <FlatList
            data={participants}
            renderItem={({ item }) =>
              item ? (
                <View style={menuStyles.dynamicCardContainer}>
                  <ParticipantCard
                    participant={item}
                    onRequestClose={onRequestClose}
                  />
                </View>
              ) : null
            }
            keyExtractor={(item) => item._id}
            ListEmptyComponent={<Text>No participants found.</Text>}
          />
        </View>
      </View>
    </BottomPopup>
  );
}
