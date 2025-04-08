import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  Dimensions,
  Animated,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import ButtonIcon from "../../icons/ButtonIcon";
import { symbolStyles } from "../../styles/components/symbolStyles";
import CameraHeader from "./components/CameraHeader";
import CameraFooter from "./components/CameraFooter";
import CameraOptions from "../../menus/camera/CameraOptions";
import { CameraView } from "expo-camera";
import { GET_PRESIGNED_URL } from "../../utils/queries/cameraQueries";
import { CREATE_CAMERA_SHOT } from "../../utils/mutations/cameraMutations";
import { useLazyQuery, useMutation } from "@apollo/client";
import { useDevelopingRoll } from "../../contexts/DevelopingRollContext";
import MessageAlert from "../../alerts/MessageAlert";
import * as ImageManipulator from "expo-image-manipulator";
import { headerStyles, layoutStyles } from "../../styles/components/index";

const screenWidth = Dimensions.get("window").width;
const cameraHeight = (screenWidth * 3) / 2;

export default function Camera({ navigation }) {
  const [showCameraOptions, setShowCameraOptions] = useState(false);
  const [cameraType, setCameraType] = useState("Standard");
  const [facing, setFacing] = useState("back");
  const [flash, setFlash] = useState("off");
  const [isProcessing, setIsProcessing] = useState(false);
  const [messageVisible, setMessageVisible] = useState(false);
  const cameraRef = useRef(null);
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const blurAnim = useRef(new Animated.Value(0)).current;

  const {
    shotsLeft, // Access shotsLeft from context
    addShot,
    decrementShotsLeft,
    initializeDevelopingRoll,
    isDevelopingRollCacheInitialized,
  } = useDevelopingRoll();

  // Initialize DevelopingRollContext cache
  useEffect(() => {
    if (!isDevelopingRollCacheInitialized) {
      initializeDevelopingRoll();
    }
  }, [isDevelopingRollCacheInitialized]);

  // Set up navigation header
  useEffect(() => {
    navigation.setOptions({
      headerShown: true,
      title: "Camera",
      headerTitle: () => (
        <CameraHeader
          cameraType={cameraType}
          handleShowCameraOptions={handleShowCameraOptions}
          showCameraOptions={showCameraOptions}
        />
      ),
      headerStyle: {
        backgroundColor: "#121212",
      },
      headerLeft: () => (
        <View style={headerStyles.headerLeft}>
          <ButtonIcon
            name="xmark"
            weight="medium"
            onPress={() => navigation.goBack()} // Navigate back
            style={symbolStyles.xmark}
          />
        </View>
      ),
      headerRight: () => (
        <View style={headerStyles.shotsLeftContainer}>
          <Text style={headerStyles.shotsLeftText}>{shotsLeft} Shots</Text>
        </View>
      ),
    });
  }, [navigation, cameraType, showCameraOptions, shotsLeft]);

  useEffect(() => {
    Animated.timing(rotateAnim, {
      toValue: showCameraOptions ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [showCameraOptions]);

  const handleShowCameraOptions = useCallback(() => {
    setShowCameraOptions((prev) => !prev);
  }, []);

  const toggleFacing = () => {
    const newFacing = facing === "back" ? "front" : "back";
    setFacing(newFacing);
  };

  const toggleFlash = () => {
    const newFlash = flash === "off" ? "on" : "off";
    setFlash(newFlash);
  };

  const handleSetCameraType = (type) => {
    setCameraType(type);
  };

  const [createCameraShot] = useMutation(CREATE_CAMERA_SHOT);
  const [getPresignedUrl] = useLazyQuery(GET_PRESIGNED_URL);

  const handleTakePhoto = async () => {
    setIsProcessing(true);
    console.log("Starting photo capture...");

    if (shotsLeft <= 0) {
      alert("No shots left for today!");
      setIsProcessing(false);
      return;
    }

    try {
      console.log("Decrementing shots left...");
      await decrementShotsLeft();

      if (cameraRef.current) {
        try {
          const photo = await cameraRef.current.takePictureAsync({
            quality: 1,
          });

          // APPLY FILTER

          const resizedUri = await resizeImage(photo.uri, 1280, 1920);
          const thumbnailUri = await resizeImage(photo.uri, 400, 600);

          const newShot = await uploadShot(resizedUri, thumbnailUri);

          console.log(newShot);

          if (newShot) {
            addShot(newShot); // Add the new shot to developing roll
          }
        } catch (error) {
          console.error("Error taking photo:", error);
          alert("Failed to capture the photo. Please try again.");
        }
      }
    } catch (error) {
      console.error("Error updating shotsLeft:", error);
      alert("Failed to update your shots. Please try again.");
    } finally {
      console.log("Resetting processing state...");
      setIsProcessing(false);
      setMessageVisible(true);
      setTimeout(() => setMessageVisible(false), 1500);
    }
  };

  const resizeImage = async (uri, width, height) => {
    const result = await ImageManipulator.manipulateAsync(
      uri,
      [{ resize: { width, height } }],
      { compress: 1, format: ImageManipulator.SaveFormat.JPEG }
    );
    return result.uri;
  };

  const uploadShot = async (originalUri, thumbnailUri) => {
    const originalFile = await uriToFile(originalUri);
    const thumbnailFile = await uriToFile(thumbnailUri);

    const originalPresigned = await getPresignedUrl({
      variables: {
        folder: "camera-images",
        fileName: originalFile.name,
        fileType: originalFile.type,
      },
    });

    const thumbnailPresigned = await getPresignedUrl({
      variables: {
        folder: "camera-images",
        fileName: thumbnailFile.name,
        fileType: thumbnailFile.type,
      },
    });

    await uploadToS3(
      originalUri,
      originalPresigned.data.getPresignedUrl.presignedUrl
    );
    await uploadToS3(
      thumbnailUri,
      thumbnailPresigned.data.getPresignedUrl.presignedUrl
    );

    const result = await createCameraShot({
      variables: {
        image: originalPresigned.data.getPresignedUrl.fileUrl,
        thumbnail: thumbnailPresigned.data.getPresignedUrl.fileUrl,
      },
    });

    console.log("Mutation Result:", result.data.createCameraShot);

    if (result.data.createCameraShot.success) {
      return result.data.createCameraShot.cameraShot;
    } else {
      throw new Error(result.data.createCameraShot.message);
    }
  };

  const uriToFile = async (uri) => {
    const response = await fetch(uri);
    const blob = await response.blob();
    return new File([blob], `photo_${Date.now()}.jpg`, { type: blob.type });
  };

  const uploadToS3 = async (fileUri, presignedUrl) => {
    const response = await fetch(fileUri);
    const blob = await response.blob();
    await fetch(presignedUrl, { method: "PUT", body: blob });
  };

  useEffect(() => {
    Animated.timing(blurAnim, {
      toValue: isProcessing ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [isProcessing]);

  return (
    <View style={layoutStyles.wrapper}>
      <CameraView
        ref={cameraRef}
        style={{ height: cameraHeight, width: screenWidth }}
        facing={facing}
        flash={flash}
      />
      {isProcessing && (
        <Animated.View
          style={{
            ...StyleSheet.absoluteFillObject,
            backgroundColor: "rgba(0,0,0,0.6)",
            opacity: blurAnim,
            justifyContent: "center",
            alignItems: "center",
            width: screenWidth,
            height: cameraHeight,
          }}
        >
          <ActivityIndicator size="large" color="#ffffff" />
          <Text style={{ color: "#ffffff", marginTop: 16 }}>Processing...</Text>
        </Animated.View>
      )}
      <MessageAlert
        message="Added to Developing Roll"
        visible={messageVisible}
      />
      <CameraFooter
        handleTakePhoto={handleTakePhoto}
        flash={flash}
        toggleFlash={toggleFlash}
        toggleFacing={toggleFacing}
        isProcessing={isProcessing}
      />
      <CameraOptions
        visible={showCameraOptions}
        onRequestClose={() => setShowCameraOptions(false)}
        setCameraType={handleSetCameraType}
      />
    </View>
  );
}
