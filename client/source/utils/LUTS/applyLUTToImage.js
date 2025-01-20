import { Surface } from "gl-react-expo";
import { LUTShader } from "./LUTShader";
import * as FileSystem from "expo-file-system";
import React, { createRef } from "react";

const applyLUTToImage = async (
  imageUri,
  cameraType,
  width,
  height,
  lutTextures
) => {
  console.log("lutTextures:", lutTextures);

  // Map cameraType to LUT index
  const lutIndex = {
    Standard: 0,
    Disposable: 1,
    Kodak: 2,
  }[cameraType];
  console.log("lutIndex:", lutIndex);

  // Ensure the LUT exists
  if (!lutTextures || !lutTextures[lutIndex]) {
    console.error("LUT not found for camera type:", cameraType);
    return imageUri; // Return original image if no LUT is found
  }

  // Render LUT processing using GL React
  const surfaceRef = createRef(); // Create a ref for the Surface
  const processedUri = await new Promise((resolve, reject) => {
    const onCapture = async () => {
      try {
        const result = await surfaceRef.current.glView.capture(); // Capture the rendered output
        console.log("result:", result);

        const processedPath = `${
          FileSystem.cacheDirectory
        }processed-image-${Date.now()}.jpg`;
        console.log("processedPath:", processedPath);

        await FileSystem.writeAsStringAsync(processedPath, result, {
          encoding: FileSystem.EncodingType.Base64,
        });
        resolve(processedPath); // Return the processed image path
      } catch (err) {
        reject(err);
      }
    };

    // Temporary Surface for LUT processing
    <Surface
      ref={surfaceRef}
      style={{ width, height }} // Set dynamic dimensions
      onContextCreate={onCapture} // Trigger capture on context creation
    >
      <LUTShader
        imageTexture={imageUri} // Input image texture
        lutTexture={lutTextures[lutIndex]} // Selected LUT texture
        imageRatio={width / height} // Dynamic aspect ratio
      />
    </Surface>;
  });

  return processedUri;
};

export default applyLUTToImage;
