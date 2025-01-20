import { Shaders, Node } from "gl-react";
import React from "react";

const shaders = Shaders.create({
  applyLUT: {
    frag: `
    precision highp float;
    varying vec2 uv;
    uniform sampler2D image; // Input image
    uniform sampler2D lut;   // LUT texture
    uniform float imageRatio; // Image aspect ratio (width / height)

    vec4 applyLUT(vec4 color) {
      float blueColor = color.b * 24.0; // Adjust for 5x5x5 LUT resolution (24 steps)
      vec2 quad1;
      vec2 quad2;
      quad1.y = floor(floor(blueColor) / 5.0); // Assuming a 5x5 LUT grid
      quad1.x = floor(blueColor) - (quad1.y * 5.0);
      quad2.y = floor(ceil(blueColor) / 5.0);
      quad2.x = ceil(blueColor) - (quad2.y * 5.0);
      vec2 texPos1;
      vec2 texPos2;
      texPos1.x = (quad1.x * 0.2) + 0.5 / 125.0; // Adjust step size for 125x125 LUT
      texPos1.y = (quad1.y * 0.2) + 0.5 / 125.0;
      texPos2.x = (quad2.x * 0.2) + 0.5 / 125.0;
      texPos2.y = (quad2.y * 0.2) + 0.5 / 125.0;
      vec4 newColor1 = texture2D(lut, texPos1);
      vec4 newColor2 = texture2D(lut, texPos2);
      vec4 newColor = mix(newColor1, newColor2, fract(blueColor));
      return vec4(newColor.rgb, color.a);
    }

    void main() {
      // Adjust UV coordinates to maintain the aspect ratio
      vec2 adjustedUV = uv;
      if (imageRatio > 1.0) {
        adjustedUV.y = (uv.y - 0.5) * (1.0 / imageRatio) + 0.5;
      } else {
        adjustedUV.x = (uv.x - 0.5) * imageRatio + 0.5;
      }

      // Fetch the color from the adjusted UV
      vec4 color = texture2D(image, adjustedUV);

      // Apply the LUT
      gl_FragColor = applyLUT(color);
    }
    `,
  },
});

export const LUTShader = ({ imageTexture, lutTexture, imageRatio }) => (
  <Node
    shader={shaders.applyLUT}
    uniforms={{
      image: imageTexture,
      lut: lutTexture,
      imageRatio,
    }}
  />
);
