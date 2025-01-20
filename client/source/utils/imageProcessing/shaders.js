export const shaders = {
  Standard: {
    vertex: `
      attribute vec4 position;
      attribute vec2 texcoord;
      varying vec2 uv;

      void main() {
        gl_Position = position;
        uv = texcoord;
      }
    `,
    fragment: `
      precision highp float;
      varying vec2 uv;
      uniform sampler2D image;
      uniform float saturation;
      uniform float contrast;
      uniform float grainAmount;
      uniform sampler2D lutTexture; // LUT texture

      vec3 applyLUT(vec3 color) {
        float size = 25.0; // LUT 3D size
        float scale = (size - 1.0) / size;
        float offset = 1.0 / (2.0 * size);

        color = clamp(color, 0.0, 1.0) * scale + offset;

        float sliceSize = 1.0 / size;
        float zSlice = floor(color.b * (size - 1.0));
        float zSliceOffset = fract(color.b * (size - 1.0));

        vec2 uv1 = vec2(color.r, color.g) * scale + offset + vec2(0.0, zSlice * sliceSize);
        vec2 uv2 = uv1 + vec2(0.0, sliceSize);

        vec3 lutColor1 = texture2D(lutTexture, uv1).rgb;
        vec3 lutColor2 = texture2D(lutTexture, uv2).rgb;

        return mix(lutColor1, lutColor2, zSliceOffset);
      }

      void main() {
        vec4 color = texture2D(image, uv);
        vec3 gray = vec3(0.3, 0.59, 0.11);
        vec3 desaturated = vec3(dot(color.rgb, gray));
        color.rgb = mix(desaturated, color.rgb, saturation);
        color.rgb += vec3(0.05, 0.03, 0.0);
        color.rgb = ((color.rgb - 0.5) * max(contrast, 0.0)) + 0.5;

        vec2 noiseCoords = uv * vec2(800.0, 800.0);
        float grain = fract(sin(dot(noiseCoords, vec2(12.9898, 78.233))) * 43758.5453);
        color.rgb += grainAmount * (grain - 0.5);

        // Apply LUT
        color.rgb = applyLUT(color.rgb);

        gl_FragColor = color;
      }
    `,
  },
  lutTextureData: `
    const lutData = [
      0.0, 0.0, 0.0, 0.043137, 0.0, 0.0, 0.082353, 0.0, 0.0, 0.12549, 0.0, 0.0, 0.168627, 0.0, 0.0, 0.207843, 0.0, 0.0, 0.25098, 0.0, 0.0, 0.290196, 0.0, 0.0, 0.333333, 0.0, 0.0, 0.376471, 0.0, 0.0, 0.415686, 0.0, 0.0, 0.458824, 0.0, 0.0, 0.501961, 0.0, 0.0, 0.541176, 0.0, 0.0, 0.584314, 0.0, 0.0, 0.623529, 0.0, 0.0, 0.666667, 0.0, 0.0, 0.709804, 0.0, 0.0, 0.74902, 0.0, 0.0, 0.792157, 0.0, 0.0, 0.835294, 0.0, 0.0, 0.87451, 0.0, 0.0, 0.917647, 0.0, 0.0, 0.956863, 0.0, 0.0, 1.0, 0.0, 0.0, ... // Full LUT array data
    ];
  `,
};

/* export const shaders = {
  Standard: {
    vertex: `
      attribute vec4 position;
      attribute vec2 texcoord;
      varying vec2 uv;

      void main() {
        gl_Position = position;
        uv = texcoord;
      }
    `,
    fragment: `
      precision highp float;
      varying vec2 uv;
      uniform sampler2D image;
      uniform float saturation;
      uniform float contrast;
      uniform float grainAmount;
      uniform sampler2D lutTexture; // LUT texture

      vec3 applyLUT(vec3 color) {
        float size = 25.0; // LUT 3D size
        float scale = (size - 1.0) / size;
        float offset = 1.0 / (2.0 * size);

        color = clamp(color, 0.0, 1.0) * scale + offset;

        float sliceSize = 1.0 / size;
        float zSlice = floor(color.b * (size - 1.0));
        float zSliceOffset = fract(color.b * (size - 1.0));

        vec2 uv1 = vec2(color.r, color.g) * scale + offset + vec2(0.0, zSlice * sliceSize);
        vec2 uv2 = uv1 + vec2(0.0, sliceSize);

        vec3 lutColor1 = texture2D(lutTexture, uv1).rgb;
        vec3 lutColor2 = texture2D(lutTexture, uv2).rgb;

        return mix(lutColor1, lutColor2, zSliceOffset);
      }

      void main() {
        vec4 color = texture2D(image, uv);
        vec3 gray = vec3(0.3, 0.59, 0.11);
        vec3 desaturated = vec3(dot(color.rgb, gray));
        color.rgb = mix(desaturated, color.rgb, saturation);
        color.rgb += vec3(0.05, 0.03, 0.0);
        color.rgb = ((color.rgb - 0.5) * max(contrast, 0.0)) + 0.5;

        vec2 noiseCoords = uv * vec2(800.0, 800.0);
        float grain = fract(sin(dot(noiseCoords, vec2(12.9898, 78.233))) * 43758.5453);
        color.rgb += grainAmount * (grain - 0.5);

        // Apply LUT
        color.rgb = applyLUT(color.rgb);

        gl_FragColor = color;
      }
    `,
  },
  lutTextureData: `
    const lutData = [
      0.0, 0.0, 0.0, 0.043137, 0.0, 0.0, 0.082353, 0.0, 0.0, 0.12549, 0.0, 0.0, 0.168627, 0.0, 0.0, 0.207843, 0.0, 0.0, 0.25098, 0.0, 0.0, 0.290196, 0.0, 0.0, 0.333333, 0.0, 0.0, 0.376471, 0.0, 0.0, 0.415686, 0.0, 0.0, 0.458824, 0.0, 0.0, 0.501961, 0.0, 0.0, 0.541176, 0.0, 0.0, 0.584314, 0.0, 0.0, 0.623529, 0.0, 0.0, 0.666667, 0.0, 0.0, 0.709804, 0.0, 0.0, 0.74902, 0.0, 0.0, 0.792157, 0.0, 0.0, 0.835294, 0.0, 0.0, 0.87451, 0.0, 0.0, 0.917647, 0.0, 0.0, 0.956863, 0.0, 0.0, 1.0, 0.0, 0.0, ... // Updated LUT array data for the third file
    ];
  `,
};
 */
