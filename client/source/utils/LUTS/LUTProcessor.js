import React, { useEffect, useRef } from "react";
import { Surface } from "gl-react-expo";
import { LUTShader } from "./LUTShader";
import * as FileSystem from "expo-file-system";

const LUTProcessor = ({ photoUri, lutUri, imageRatio, onProcessed }) => {
  const surfaceRef = useRef();
  console.log("photoUri:", photoUri);
  console.log("lutUri:", lutUri);
  console.log("imageRatio:", imageRatio);
  console.log("onProcessed:", onProcessed);

  useEffect(() => {
    const processImage = async () => {
      try {
        console.log("STEP 1");

        const processedUri = await surfaceRef.current.glView.capture();
        console.log("processedUri:", processedUri);

        const targetPath = `${FileSystem.documentDirectory}processed-image.png`;
        console.log(targetPath);

        await FileSystem.copyAsync({ from: processedUri, to: targetPath });
        console.log("STEP 2");

        onProcessed(targetPath);
      } catch (error) {
        console.error("Error processing image with LUT:", error);
      }
    };

    if (photoUri && lutUri) {
      processImage();
    }
  }, [photoUri, lutUri]);

  return (
    <Surface style={{ width: 0, height: 0 }} ref={surfaceRef}>
      <LUTShader
        imageTexture={{ uri: photoUri }}
        lutTexture={{ uri: lutUri }}
        imageRatio={imageRatio}
      />
    </Surface>
  );
};

export default LUTProcessor;

/* import React, { useEffect, createRef } from "react";
import { Surface } from "gl-react-expo";
import { LUTShader } from "./LUTShader";
import * as FileSystem from "expo-file-system";

const LUTProcessor = ({ imageUri, lutTexture, width, height, onComplete }) => {
  const surfaceRef = createRef();

  useEffect(() => {
    const processImage = async () => {
      try {
        console.log("HEY"); // This should now log
        const result = await surfaceRef.current.glView.capture();
        console.log("result:", result);

        const processedPath = `${
          FileSystem.cacheDirectory
        }processed-image-${Date.now()}.jpg`;
        console.log("processedPath:", processedPath);

        await FileSystem.writeAsStringAsync(processedPath, result, {
          encoding: FileSystem.EncodingType.Base64,
        });

        onComplete(null, processedPath); // Return processed URI
      } catch (error) {
        console.error("Error during LUT processing:", error);
        onComplete(error);
      }
    };

    processImage();
  }, [imageUri, lutTexture]);

  return (
    <Surface ref={surfaceRef} style={{ width, height }}>
      <LUTShader
        imageTexture={imageUri}
        lutTexture={lutTexture}
        imageRatio={width / height}
      />
    </Surface>
  );
};

export default LUTProcessor;
 */
