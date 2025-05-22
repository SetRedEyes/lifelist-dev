import React, { useEffect, useRef, useState } from "react";
import {
  useImage,
  ImageFormat,
  useCanvasRef,
} from "@shopify/react-native-skia";
import { Buffer } from "buffer";
import { LUTShader } from "./LUTShader";
import * as FileSystem from "expo-file-system";
import MessageAlert from "../../alerts/MessageAlert";
import * as ImageManipulator from "expo-image-manipulator";
import { GET_PRESIGNED_URL } from "../../utils/queries/cameraQueries";
import { CREATE_CAMERA_SHOT } from "../../utils/mutations/cameraMutations";
import { useLazyQuery, useMutation } from "@apollo/client";
import { Text, Animated, StyleSheet, ActivityIndicator } from "react-native";
import { useDevelopingRoll } from "../../contexts/DevelopingRollContext";
import { CAMERA_HEIGHT, SCREEN_WIDTH } from "./Camera";

export const LutImageProcessor = ({
  photoUri,
  cameraType,
  isProcessing,
  setIsProcessing,
  setPhotoUri,
}) => {
  const { addShot } = useDevelopingRoll();
  const canvasRef = useCanvasRef();
  const photoImg = useImage(photoUri);
  const [messageVisible, setMessageVisible] = useState(false);
  const blurAnim = useRef(new Animated.Value(0)).current;
  console.log("photoUri!!!!!!!!!!!!", photoUri);

  useEffect(() => {
    Animated.timing(blurAnim, {
      toValue: isProcessing ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [isProcessing]);

  useEffect(() => {
    if (!photoUri || !canvasRef.current) return;

    const applyLUT = async () => {
      try {
        await new Promise(requestAnimationFrame);

        const skImage = await canvasRef.current.makeImageSnapshotAsync();

        const bytes = skImage.encodeToBytes(ImageFormat.JPEG, 100);

        const base64 = Buffer.from(bytes).toString("base64");

        const outPath = FileSystem.cacheDirectory + `lut_${Date.now()}.jpg`;

        await FileSystem.writeAsStringAsync(outPath, base64, {
          encoding: FileSystem.EncodingType.Base64,
        });
        const resizedUri = await resizeImage(outPath, 1280, 1920);
        const thumbUri = await resizeImage(outPath, 400, 600);
        const newShot = await uploadShot(resizedUri, thumbUri);
        if (newShot) await addShot(newShot);
      } catch (error) {
        setIsProcessing(false);
        console.error("Error applying LUT:", error);
      } finally {
        console.log("Resetting processing state...");
        setIsProcessing(false);
        setMessageVisible(true);
        setPhotoUri(null);
        setTimeout(() => setMessageVisible(false), 1500);
      }
    };
    applyLUT();
  }, [photoUri]);

  const [createCameraShot] = useMutation(CREATE_CAMERA_SHOT);
  const [getPresignedUrl] = useLazyQuery(GET_PRESIGNED_URL);

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

  return (
    <>
      <MessageAlert
        message='Added to Developing Roll'
        visible={messageVisible}
      />
      {isProcessing && (
        <Animated.View
          style={{
            ...StyleSheet.absoluteFillObject,
            backgroundColor: "rgba(0,0,0,0.6)",
            opacity: blurAnim,
            justifyContent: "center",
            alignItems: "center",
            width: SCREEN_WIDTH,
            height: CAMERA_HEIGHT,
          }}
        >
          <ActivityIndicator size='large' color='#ffffff' />
          <Text style={{ color: "#ffffff", marginTop: 16 }}>Processing...</Text>
        </Animated.View>
      )}
      <LUTShader photo={photoImg} cameraType={cameraType} ref={canvasRef} />
    </>
  );
};
