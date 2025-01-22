import React, { useRef } from "react";
import { Surface } from "gl-react-expo";
import { Node } from "gl-react";
import * as FileSystem from "expo-file-system";
import { shaders } from "./shaders";

export const applyLUTFilter = async (inputUri, lutTextureUri) => {
  const glViewRef = useRef(null);

  return new Promise((resolve, reject) => {
    const FilterComponent = (
      <Surface
        style={{ width: 1280, height: 1920 }}
        ref={(ref) => {
          glViewRef.current = ref; // Attach ref
        }}
      >
        <Node
          shader={shaders.LUT}
          uniforms={{
            inputImageTexture: { uri: inputUri },
            lutTexture: { uri: lutTextureUri },
          }}
        />
      </Surface>
    );

    // Wait until ref is available
    setTimeout(() => {
      if (glViewRef.current) {
        glViewRef.current
          .takeSnapshotAsync({ format: "png", quality: 1 })
          .then(async (snapshotUri) => {
            const savedUri = `${
              FileSystem.documentDirectory
            }filtered_${Date.now()}.png`;
            await FileSystem.moveAsync({ from: snapshotUri, to: savedUri });
            resolve(savedUri);
          })
          .catch(reject);
      } else {
        reject(new Error("GLView reference is not available."));
      }
    }, 100); // Adjust delay as needed
  });
};
