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
import {
  saveMetadataToCache,
  getMetadataFromCache,
} from "../../utils/caching/cacheHelpers";
import * as ImageManipulator from "expo-image-manipulator";
import { headerStyles, layoutStyles } from "../../styles/components/index";
import { useFocusEffect } from "@react-navigation/native";

const screenWidth = Dimensions.get("window").width;
const cameraHeight = (screenWidth * 3) / 2;
const MAX_SHOTS_PER_DAY = 10;
const SHOTS_LEFT_KEY = "shotsLeft";

export default function Camera({ navigation }) {
  const [shotsLeft, setShotsLeft] = useState(MAX_SHOTS_PER_DAY);
  const [showCameraOptions, setShowCameraOptions] = useState(false);
  const [cameraType, setCameraType] = useState("Standard");
  const [facing, setFacing] = useState("back");
  const [flash, setFlash] = useState("off");
  const [isProcessing, setIsProcessing] = useState(false);
  const [messageVisible, setMessageVisible] = useState(false);
  const cameraRef = useRef(null);
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const blurAnim = useRef(new Animated.Value(0)).current;

  // Fetch cached values on component mount
  useEffect(() => {
    const fetchCacheValues = async () => {
      try {
        // Fetch cameraType
        const cachedCameraType = await getMetadataFromCache("cameraType", true);
        if (cachedCameraType) setCameraType(cachedCameraType);

        // Fetch cameraFacing
        const cachedFacing = await getMetadataFromCache("cameraFacing", true);
        if (cachedFacing) setFacing(cachedFacing);

        // Fetch cameraFlash
        const cachedFlash = await getMetadataFromCache("cameraFlash", true);
        if (cachedFlash) setFlash(cachedFlash);
      } catch (error) {
        console.error("Error fetching camera settings from cache:", error);
      }
    };

    fetchCacheValues();
  }, []);

  const {
    developingShots,
    addShot,
    initializeDevelopingRoll,
    isDevelopingRollCacheInitialized,
  } = useDevelopingRoll();

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
  }, [
    navigation,
    cameraType,
    showCameraOptions,
    handleShowCameraOptions,
    shotsLeft,
  ]);

  useEffect(() => {
    // Animate the rotation based on the popup visibility
    Animated.timing(rotateAnim, {
      toValue: showCameraOptions ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [showCameraOptions]);

  const handleShowCameraOptions = useCallback(() => {
    setShowCameraOptions((prev) => !prev);
  }, []);

  /* const handleShowCameraOptions = () => setShowCameraOptions((prev) => !prev); */

  // Save camera metadata
  const toggleFacing = () => {
    const newFacing = facing === "back" ? "front" : "back";
    setFacing(newFacing);
    saveMetadataToCache("cameraFacing", newFacing, false); // Temporary cache
  };

  const toggleFlash = () => {
    const newFlash = flash === "off" ? "on" : "off";
    setFlash(newFlash);
    saveMetadataToCache("cameraFlash", newFlash, false); // Temporary cache
  };

  const handleSetCameraType = (type) => {
    setCameraType(type);
    saveMetadataToCache("cameraType", type, true); // Persistent cache
  };

  useEffect(() => {
    const loadCameraType = async () => {
      const storedCameraType = await getFromAsyncStorage("cameraType");
      if (storedCameraType) {
        setCameraType(storedCameraType);
      }
    };
    loadCameraType();
  }, []);

  // Initialize DevelopingRollContext Cache
  useEffect(() => {
    if (!isDevelopingRollCacheInitialized) {
      initializeDevelopingRoll();
    }
  }, [isDevelopingRollCacheInitialized]);

  useEffect(() => {
    const loadCacheAndCalculateShots = async () => {
      if (!isDevelopingRollCacheInitialized) {
        await initializeDevelopingRoll();
      }
    };

    loadCacheAndCalculateShots();
  }, [isDevelopingRollCacheInitialized, developingShots]);

  // Helper to calculate the TTL until midnight
  const getTimeUntilMidnight = () => {
    const now = new Date();
    const midnight = new Date();
    midnight.setHours(24, 0, 0, 0); // Set to midnight of the next day
    return midnight.getTime() - now.getTime();
  };

  useFocusEffect(
    useCallback(() => {
      const checkShotsCache = async () => {
        const cachedShotsLeft = await getMetadataFromCache(
          SHOTS_LEFT_KEY,
          true
        );

        // If TTL has expired or there's no cache, reset shotsLeft
        if (cachedShotsLeft === null) {
          const ttl = getTimeUntilMidnight();
          await saveMetadataToCache(
            SHOTS_LEFT_KEY,
            MAX_SHOTS_PER_DAY,
            true,
            ttl
          );
          setShotsLeft(MAX_SHOTS_PER_DAY);
        } else {
          setShotsLeft(cachedShotsLeft);
        }
      };

      checkShotsCache();
    }, [])
  );

  // CAMERA SHOT CREATION
  const [createCameraShot] = useMutation(CREATE_CAMERA_SHOT);
  const [getPresignedUrl] = useLazyQuery(GET_PRESIGNED_URL);

  const handleTakePhoto = async () => {
    setIsProcessing(true);

    if (shotsLeft <= 0) {
      alert("No shots left for today!");
      setIsProcessing(false);
      return;
    }

    // Immediately decrement shotsLeft and update cache
    const newShotsLeft = shotsLeft - 1;
    setShotsLeft(newShotsLeft);

    try {
      await saveMetadataToCache(SHOTS_LEFT_KEY, newShotsLeft, true);

      if (cameraRef.current) {
        try {
          // Capture the photo
          const photo = await cameraRef.current.takePictureAsync({
            quality: 1,
          });

          const resizedUri = await resizeImage(photo.uri, 1280, 1920);
          const thumbnailUri = await resizeImage(photo.uri, 400, 600);

          // Upload the resized image and thumbnail
          const newShot = await uploadShot(resizedUri, thumbnailUri);

          if (newShot) {
            addShot(newShot);
          }
        } catch (error) {
          console.error("Error taking photo:", error);

          // Revert shotsLeft in case of an error
          setShotsLeft(shotsLeft);
          await saveMetadataToCache(SHOTS_LEFT_KEY, shotsLeft, true);
        }
      }
    } catch (error) {
      console.error("Error updating shotsLeft cache:", error);
      alert("Failed to update your shots. Please try again.");
    } finally {
      setIsProcessing(false);

      // Show the alert message
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

  // Animate blur overlay
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
      {/* Loading Overlay */}
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
      {/* Message Alert */}
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
