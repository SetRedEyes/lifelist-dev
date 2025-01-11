import React, { useState } from "react";
import { Modal, View, Text, Pressable, TextInput } from "react-native";
import { BlurView } from "expo-blur";
import { alertStyles } from "../styles/components/alertStyles";

const FormAlert = ({ visible, onRequestClose, title, subheader, onSave }) => {
  const [inputValue, setInputValue] = useState("");

  const handleSave = () => {
    if (inputValue.trim()) {
      onSave(inputValue);
      setInputValue(""); // Reset input after saving
    }
  };

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
            <View>
              <Pressable
                style={alertStyles.modalView}
                onPress={(e) => e.stopPropagation()}
              >
                {title && <Text style={alertStyles.modalHeader}>{title}</Text>}
                {subheader && (
                  <Text style={alertStyles.modalSubheader}>{subheader}</Text>
                )}
                <TextInput
                  style={alertStyles.input}
                  value={inputValue}
                  onChangeText={setInputValue}
                  placeholder="Title"
                  placeholderTextColor="#aaaaaa"
                  autoFocus={true}
                />
                <View style={alertStyles.actionFormButtons}>
                  <Pressable
                    style={alertStyles.saveButton}
                    onPress={handleSave}
                  >
                    <Text style={alertStyles.saveButtonText}>Save</Text>
                  </Pressable>
                  <Pressable
                    style={alertStyles.cancelButton}
                    onPress={onRequestClose}
                  >
                    <Text style={alertStyles.cancelButtonText}>Cancel</Text>
                  </Pressable>
                </View>
              </Pressable>
            </View>
          </View>
        </BlurView>
      </Pressable>
    </Modal>
  );
};

export default FormAlert;
