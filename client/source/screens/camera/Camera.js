import React, { useCallback, useEffect, useRef, useState } from "react";
import { View, Text, Dimensions, Animated } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useDevelopingRoll } from "../../contexts/DevelopingRollContext";
import { headerStyles, layoutStyles } from "../../styles/components/index";
import CameraHeader from "./components/CameraHeader";
import CameraOptions from "../../menus/camera/CameraOptions";
import CameraFooter from "./components/CameraFooter";
import { symbolStyles } from "../../styles/components/symbolStyles";
import ButtonIcon from "../../icons/ButtonIcon";
import { LutImageProcessor } from "./LutImageProcessor";

export const SCREEN_WIDTH = Dimensions.get("window").width;
export const CAMERA_HEIGHT = (SCREEN_WIDTH * 3) / 2;

export default function Camera({ navigation }) {
  const [showCameraOptions, setShowCameraOptions] = useState(false);
  const [cameraType, setCameraType] = useState("Standard");
  const [facing, setFacing] = useState("back");
  const [flash, setFlash] = useState("off");
  const [isProcessing, setIsProcessing] = useState(false);
  const cameraRef = useRef(null);
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const [photoUri, setPhotoUri] = useState(null);

  const {
    shotsLeft, // Access shotsLeft from context
    decrementShotsLeft,
    initializeDevelopingRoll,
    isDevelopingRollCacheInitialized,
  } = useDevelopingRoll();

  const [requestPermission] = useCameraPermissions();

  useEffect(() => {
    (async () => {
      const { status } = await requestPermission();
      if (status !== "granted") {
        alert("Camera permission is required!");
      }
    })();
  }, []);

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
            name='xmark'
            weight='medium'
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
          setPhotoUri(photo.uri);
        } catch (error) {
          console.error("Error taking photo:", error);
          alert("Failed to capture the photo. Please try again.");
        }
      }
    } catch (error) {
      console.error("Error updating shotsLeft:", error);
      alert("Failed to update your shots. Please try again.");
    }
  };

  return (
    <View style={layoutStyles.wrapper}>
      <CameraView
        ref={cameraRef}
        style={{ height: CAMERA_HEIGHT, width: SCREEN_WIDTH }}
        facing={facing}
        flash={flash}
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
      <LutImageProcessor
        photoUri={photoUri}
        cameraType={cameraType}
        isProcessing={isProcessing}
        setIsProcessing={setIsProcessing}
        setPhotoUri={setPhotoUri}
      />
    </View>
  );
}
