import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { View, Text, StyleSheet, Dimensions, Animated } from "react-native";
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
import {
  saveMetadataToCache,
  getMetadataFromCache,
} from "../../utils/caching/cacheHelpers";
import * as ImageManipulator from "expo-image-manipulator";
import { layoutStyles } from "../../styles/components/index";

const screenWidth = Dimensions.get("window").width;
const cameraHeight = (screenWidth * 3) / 2;
const MAX_SHOTS_PER_DAY = 10;

export default function Camera({ navigation }) {
  const [shotsLeft, setShotsLeft] = useState(MAX_SHOTS_PER_DAY);
  const [showCameraOptions, setShowCameraOptions] = useState(false);
  const [cameraType, setCameraType] = useState("Standard");
  const [facing, setFacing] = useState("back");
  const [flash, setFlash] = useState("off");
  const cameraRef = useRef(null);
  const rotateAnim = useRef(new Animated.Value(0)).current;

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
        <View style={styles.headerLeft}>
          <ButtonIcon
            name="xmark"
            weight="medium"
            onPress={() => navigation.goBack()} // Navigate back
            style={symbolStyles.xmark}
          />
        </View>
      ),
      headerRight: () => (
        <View style={styles.shotsLeftContainer}>
          <Text style={styles.shotsLeftText}>{shotsLeft} Shots</Text>
        </View>
      ),
    });
  }, [navigation, cameraType, showCameraOptions, handleShowCameraOptions]);

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

  const rotation = useMemo(() => {
    return rotateAnim.interpolate({
      inputRange: [0, 1],
      outputRange: ["0deg", "90deg"],
    });
  }, [rotateAnim]);

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

  const calculateTodayShots = () => {
    const today = new Date().toISOString().split("T")[0];
    return developingShots.filter(
      (shot) => new Date(shot.capturedAt).toISOString().split("T")[0] === today
    ).length;
  };

  // Initialize DevelopingRollContext Cache
  useEffect(() => {
    if (!isDevelopingRollCacheInitialized) {
      initializeDevelopingRoll();
    }
  }, [isDevelopingRollCacheInitialized]);

  useEffect(() => {
    const loadCacheAndCalculateShots = async () => {
      if (!isDevelopingRollCacheInitialized) {
        await initializeDevelopingRollCache();
      }
      const todayShots = calculateTodayShots();

      setShotsLeft(MAX_SHOTS_PER_DAY - todayShots);
    };

    loadCacheAndCalculateShots();
  }, [isDevelopingRollCacheInitialized, developingShots]);

  // Reset shots at midnight
  const resetShotsAtMidnight = async () => {
    const now = new Date();
    const today = now.toISOString().split("T")[0]; // Get today's date (YYYY-MM-DD)
    const storedDate = await getMetadataFromCache("shotsLastResetDate", true);

    if (storedDate !== today) {
      // Reset the shot count if the stored date is different
      saveMetadataToCache("shotsLastResetDate", today, true);
      saveMetadataToCache("shotsLeft", MAX_SHOTS_PER_DAY, true);
      setShotsLeft(MAX_SHOTS_PER_DAY);
    } else {
      // Otherwise, restore the remaining shots from the cache
      const cachedShotsLeft = await getMetadataFromCache("shotsLeft", true);
      if (cachedShotsLeft !== null) {
        setShotsLeft(cachedShotsLeft);
      }
    }
  };

  useEffect(() => {
    resetShotsAtMidnight();
  }, []);

  // CAMERA SHOT CREATION
  const [createCameraShot] = useMutation(CREATE_CAMERA_SHOT);
  const [getPresignedUrl] = useLazyQuery(GET_PRESIGNED_URL);

  const handleTakePhoto = async () => {
    if (shotsLeft <= 0) {
      alert("No shots left for today!");
      return;
    }

    // Initialize cache if not already done
    if (!isDevelopingRollCacheInitialized) {
      await initializeDevelopingRollCache();
    }

    if (cameraRef.current) {
      try {
        // Capture the photo
        const photo = await cameraRef.current.takePictureAsync({ quality: 1 });
        const resizedUri = await resizeImage(photo.uri, 1280, 1920);
        const thumbnailUri = await resizeImage(photo.uri, 400, 600);

        // Upload the resized image and thumbnail
        const newShot = await uploadShot(resizedUri, thumbnailUri);
        addShot(newShot);

        const newShotsLeft = shotsLeft - 1;
        setShotsLeft(newShotsLeft);
        saveMetadataToCache("shotsLeft", newShotsLeft, true); // Persistent cache
      } catch (error) {
        console.error("Error taking photo:", error);
      }
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

  return (
    <View style={layoutStyles.wrapper}>
      <CameraView
        ref={cameraRef}
        style={{ height: cameraHeight, width: screenWidth }}
        facing={facing}
      />
      <CameraFooter
        handleTakePhoto={handleTakePhoto}
        flash={flash}
        toggleFlash={toggleFlash}
        toggleFacing={toggleFacing}
      />
      <CameraOptions
        visible={showCameraOptions}
        onRequestClose={() => setShowCameraOptions(false)}
        setCameraType={handleSetCameraType}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerLeft: {
    marginLeft: 16,
  },
  shotsLeftContainer: {
    marginRight: 16,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1C1C1C",
    borderRadius: 50,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  shotsLeftText: {
    color: "#696969", // Light grey text
    fontSize: 12,
    fontWeight: "500",
  },
});
