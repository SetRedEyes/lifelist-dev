import React from "react";
import { Modal, View, Text, Pressable } from "react-native";
import { BlurView } from "expo-blur";
import { alertStyles } from "../styles/components/alertStyles";

const DangerAlert = ({
  visible,
  onRequestClose,
  title,
  message,
  onConfirm,
  onCancel = onRequestClose,
  confirmButtonText = "Delete",
  cancelButtonText = "Cancel",
}) => {
  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onRequestClose}
    >
      <Pressable style={alertStyles.absolute} onPress={onRequestClose}>
        <BlurView style={alertStyles.absolute} blurType="dark" blurAmount={10}>
          <View style={alertStyles.centeredView}>
            <Pressable
              style={alertStyles.modalView}
              onPress={(e) => e.stopPropagation()}
            >
              {title && <Text style={alertStyles.modalHeader}>{title}</Text>}
              <Text style={alertStyles.modalSubheader}>{message}</Text>
              <View style={alertStyles.actionButtons}>
                <Pressable
                  style={alertStyles.confirmButton}
                  onPress={onConfirm}
                >
                  <Text style={alertStyles.confirmButtonText}>
                    {confirmButtonText}
                  </Text>
                </Pressable>
                <Pressable style={alertStyles.cancelButton} onPress={onCancel}>
                  <Text style={alertStyles.cancelButtonText}>
                    {cancelButtonText}
                  </Text>
                </Pressable>
              </View>
            </Pressable>
          </View>
        </BlurView>
      </Pressable>
    </Modal>
  );
};

export default DangerAlert;
