import React, { useState, useEffect } from "react";
import { View, FlatList, Text, Pressable, Alert } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useMutation } from "@apollo/client";
import {
  REPORT_COLLAGE,
  REPORT_COMMENT,
  REPORT_MOMENT,
  REPORT_PROFILE,
} from "../../utils/mutations/reportMutations";
import { headerStyles } from "../../styles/components/headerStyles"; // Import the header styles
import DangerAlert from "../../alerts/DangerAlert";
import ReportCard from "../../cards/report/ReportCard";
import ButtonIcon from "../../icons/ButtonIcon";
import { symbolStyles } from "../../styles/components/symbolStyles";
import { layoutStyles } from "../../styles/components";

const reportReasons = [
  { label: "Inappropriate Content", value: "INAPPROPRIATE_CONTENT" },
  { label: "Copyright Violation", value: "COPYRIGHT_VIOLATION" },
  { label: "Harassment or Bullying", value: "HARASSMENT_OR_BULLYING" },
  {
    label: "False Information or Misrepresentation",
    value: "FALSE_INFORMATION_OR_MISREPRESENTATION",
  },
  {
    label: "Violates Community Guidelines",
    value: "VIOLATES_COMMUNITY_GUIDELINES",
  },
  { label: "Spam or Scams", value: "SPAM_OR_SCAMS" },
  { label: "Nudity or Sexual Content", value: "NUDITY_OR_SEXUAL_CONTENT" },
  {
    label: "Hate Speech or Discrimination",
    value: "HATE_SPEECH_OR_DISCRIMINATION",
  },
  { label: "Impersonation", value: "IMPERSONATION" },
  { label: "Unsolicited Contact", value: "UNSOLICITED_CONTACT" },
  { label: "Underage Account", value: "UNDERAGE_ACCOUNT" },
  { label: "Unauthorized Activity", value: "UNAUTHORIZED_ACTIVITY" },
  { label: "Other", value: "OTHER" },
];

export default function Report({ route }) {
  const navigation = useNavigation();
  const { entityId, entityType } = route.params;
  const [selectedReason, setSelectedReason] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  const [reportCollage] = useMutation(REPORT_COLLAGE);
  const [reportComment] = useMutation(REPORT_COMMENT);
  const [reportMoment] = useMutation(REPORT_MOMENT);
  const [reportProfile] = useMutation(REPORT_PROFILE);

  const handleReportPress = (reason) => {
    setSelectedReason(reason);
  };

  const handleConfirm = async () => {
    try {
      if (!entityId || !entityType || !selectedReason) {
        throw new Error("Missing required information to report.");
      }

      switch (entityType) {
        case "COLLAGE":
          await reportCollage({
            variables: { collageId: entityId, reason: selectedReason },
          });
          break;
        case "COMMENT":
          await reportComment({
            variables: { commentId: entityId, reason: selectedReason },
          });
          break;
        case "MOMENT":
          await reportMoment({
            variables: { momentId: entityId, reason: selectedReason },
          });
          break;
        case "PROFILE":
          await reportProfile({
            variables: { profileId: entityId, reason: selectedReason },
          });
          break;
        default:
          throw new Error("Unsupported entity type.");
      }

      Alert.alert(
        "Report Submitted",
        "Your report has been submitted successfully."
      );
      setModalVisible(false);
      navigation.popToTop();
    } catch (error) {
      console.error("Error reporting:", error);
      Alert.alert("Error", "Failed to submit the report. Please try again.");
      setModalVisible(false);
    }
  };

  useEffect(() => {
    navigation.setOptions({
      headerTitle: "Report",
      headerLeft: () => (
        <View style={headerStyles.headerLeft}>
          <ButtonIcon
            name="chevron.backward"
            weight="medium"
            onPress={() => navigation.goBack()}
            style={symbolStyles.backArrow}
          />
        </View>
      ),
      headerRight: () => (
        <Pressable
          onPress={() => setModalVisible(true)}
          disabled={!selectedReason}
          style={headerStyles.headerRight}
        >
          <Text
            style={[
              headerStyles.saveButtonText,
              selectedReason && headerStyles.saveButtonTextActive,
            ]}
          >
            Submit
          </Text>
        </Pressable>
      ),
    });
  }, [navigation, selectedReason]);

  const renderItem = ({ item }) => (
    <ReportCard
      label={item.label}
      selected={selectedReason === item.value}
      onSelect={() => handleReportPress(item.value)}
    />
  );

  return (
    <View style={[layoutStyles.wrapper, { paddingHorizontal: 8 }]}>
      <FlatList
        data={reportReasons}
        renderItem={renderItem}
        keyExtractor={(item) => item.value}
      />
      <DangerAlert
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
        title="Confirm Report"
        message={`Are you sure you want to report this ${entityType.toLowerCase()} for ${selectedReason
          ?.replace(/_/g, " ")
          .toLowerCase()}?`}
        onConfirm={handleConfirm}
        onCancel={() => setModalVisible(false)}
        confirmButtonText="Report"
        cancelButtonText="Cancel"
      />
    </View>
  );
}
