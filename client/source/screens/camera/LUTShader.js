import React, { forwardRef } from "react";
import {
  Canvas,
  Fill,
  Group,
  Shader,
  ImageShader,
  Skia,
  useImage,
} from "@shopify/react-native-skia";
import { CAMERA_HEIGHT, SCREEN_WIDTH } from "./Camera";

const LUT_SHADER_CODE = `
  uniform shader image;
  uniform shader luts;

  half4 main(float2 xy) {
    vec4 color = image.eval(xy);
    int r = int(color.r * 255.0 / 4.0);
    int g = int(color.g * 255.0 / 4.0);
    int b = int(color.b * 255.0 / 4.0);
    float lutX = float(int(mod(float(b), 8.0)) * 64 + r);
    float lutY = float(int((b / 8) * 64 + g));
    return luts.eval(float2(lutX, lutY));
  }
`;

export const LUTShader = forwardRef(({ photo, cameraType }, ref) => {
  const getLutByCameraType = (cameraType) => {
    switch (cameraType) {
      case "Standard":
        return useImage(require("../../../assets/luts/test-lut.png"));
      case "Disposable":
        return useImage(require("../../../assets/luts/test-lut.png"));
      case "Kodak":
        return useImage(require("../../../assets/luts/test-lut.png"));
      default:
        return useImage(require("../../../assets/luts/test-lut.png"));
    }
  };

  const selectedLut = getLutByCameraType(cameraType);

  const shaderEffect = Skia.RuntimeEffect.Make(LUT_SHADER_CODE);

  if (!photo && !selectedLut && !shaderEffect) return null;

  return (
    <Canvas
      ref={ref}
      style={{
        position: "absolute",
        width: SCREEN_WIDTH,
        height: CAMERA_HEIGHT,
        left: -SCREEN_WIDTH,
        top: -CAMERA_HEIGHT,
      }}
    >
      <Group>
        <Fill />
        <Shader source={shaderEffect}>
          <ImageShader
            image={photo}
            fit='cover'
            rect={{ x: 0, y: 0, width: SCREEN_WIDTH, height: CAMERA_HEIGHT }}
          />
          <ImageShader
            image={selectedLut}
            fit='none'
            rect={{ x: 0, y: 0, width: 512, height: 512 }}
          />
        </Shader>
      </Group>
    </Canvas>
  );
});
LUTShader.displayName = "LUTShader";
