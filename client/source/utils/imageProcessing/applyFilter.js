import { GLView } from "expo-gl";
import { Asset } from "expo-asset";

export const applyFilter = async (imageUri, filterOptions) => {
  const {
    saturation = 1.0,
    contrast = 1.0,
    grainAmount = 0.1,
    lutTextureUri,
  } = filterOptions;

  return new Promise(async (resolve, reject) => {
    try {
      const gl = await GLView.createContextAsync();

      // Vertex shader
      const vertexShaderSource = `
        attribute vec4 position;
        attribute vec2 texcoord;
        varying vec2 uv;

        void main() {
          gl_Position = position;
          uv = texcoord;
        }
      `;

      // Fragment shader
      const fragmentShaderSource = `
        precision highp float;
        varying vec2 uv;
        uniform sampler2D image;
        uniform float saturation;
        uniform float contrast;
        uniform float grainAmount;
        uniform sampler2D lutTexture;

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
      `;

      // Compile shaders
      const vertexShader = gl.createShader(gl.VERTEX_SHADER);
      gl.shaderSource(vertexShader, vertexShaderSource);
      gl.compileShader(vertexShader);

      const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
      gl.shaderSource(fragmentShader, fragmentShaderSource);
      gl.compileShader(fragmentShader);

      const program = gl.createProgram();
      gl.attachShader(program, vertexShader);
      gl.attachShader(program, fragmentShader);
      gl.linkProgram(program);
      gl.useProgram(program);

      // Load and bind image texture
      const imageAsset = Asset.fromURI(imageUri);
      await imageAsset.downloadAsync();
      const imageTexture = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, imageTexture);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        gl.RGBA,
        gl.RGBA,
        gl.UNSIGNED_BYTE,
        await createImageBitmap(imageAsset)
      );

      // Load and bind LUT texture
      const lutAsset = Asset.fromURI(lutTextureUri);
      await lutAsset.downloadAsync();
      const lutTexture = gl.createTexture();
      gl.activeTexture(gl.TEXTURE1);
      gl.bindTexture(gl.TEXTURE_2D, lutTexture);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        gl.RGBA,
        gl.RGBA,
        gl.UNSIGNED_BYTE,
        await createImageBitmap(lutAsset)
      );

      // Set shader uniforms
      gl.uniform1f(gl.getUniformLocation(program, "saturation"), saturation);
      gl.uniform1f(gl.getUniformLocation(program, "contrast"), contrast);
      gl.uniform1f(gl.getUniformLocation(program, "grainAmount"), grainAmount);
      gl.uniform1i(gl.getUniformLocation(program, "image"), 0); // TEXTURE0
      gl.uniform1i(gl.getUniformLocation(program, "lutTexture"), 1); // TEXTURE1

      // Render to framebuffer
      const framebuffer = gl.createFramebuffer();
      gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
      gl.framebufferTexture2D(
        gl.FRAMEBUFFER,
        gl.COLOR_ATTACHMENT0,
        gl.TEXTURE_2D,
        imageTexture,
        0
      );

      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

      // Take snapshot of the rendered output
      const snapshot = await GLView.takeSnapshotAsync(gl, {
        format: "jpeg",
        quality: 1.0,
        result: "file",
      });

      gl.bindFramebuffer(gl.FRAMEBUFFER, null);

      resolve(snapshot.uri);
    } catch (error) {
      console.error("Error in applyFilter:", error);
      reject(error);
    }
  });
};

/* import { GLView } from "expo-gl";
import { Asset } from "expo-asset";
import { shaders } from "./shaders";

export const applyFilter = async (imageUri, filter) => {
  return new Promise(async (resolve, reject) => {
    try {
      const shaderCode = shaders[filter];
      const gl = await GLView.createContextAsync();

      // Compile and link shaders
      const program = gl.createProgram();
      const vertexShader = gl.createShader(gl.VERTEX_SHADER);
      const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);

      gl.shaderSource(vertexShader, shaderCode.vertex);
      gl.compileShader(vertexShader);
      if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
        throw new Error(
          "Vertex shader error: " + gl.getShaderInfoLog(vertexShader)
        );
      }
      gl.shaderSource(fragmentShader, shaderCode.fragment);
      gl.compileShader(fragmentShader);
      if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
        throw new Error(
          "Fragment shader error: " + gl.getShaderInfoLog(fragmentShader)
        );
      }

      gl.attachShader(program, vertexShader);
      gl.attachShader(program, fragmentShader);
      gl.linkProgram(program);
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        throw new Error(
          "Shader program link error: " + gl.getProgramInfoLog(program)
        );
      }
      gl.useProgram(program);

      // Load and bind image texture
      const asset = Asset.fromURI(imageUri);
      await asset.downloadAsync();

      const texture = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true); // Flip Y-axis
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        gl.RGBA,
        gl.RGBA,
        gl.UNSIGNED_BYTE,
        asset
      );

      // Set up framebuffer
      const framebuffer = gl.createFramebuffer();
      gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
      gl.framebufferTexture2D(
        gl.FRAMEBUFFER,
        gl.COLOR_ATTACHMENT0,
        gl.TEXTURE_2D,
        texture,
        0
      );

      const framebufferStatus = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
      if (framebufferStatus !== gl.FRAMEBUFFER_COMPLETE) {
        throw new Error(
          "Framebuffer is not complete. Status: " + framebufferStatus
        );
      }

      // Clear and draw with shader
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

      // Capture the result
      const snapshotResult = await GLView.takeSnapshotAsync(gl, {
        format: "jpeg", // Use JPEG for smaller files
        quality: 0.8, // Adjust quality for compression
        result: "file", // Save as a file
      });

      const filteredImageUri = snapshotResult.uri || snapshotResult.localUri;
      if (!filteredImageUri) {
        throw new Error("Failed to generate filtered image URI");
      }

      // Clean up and resolve
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      resolve(filteredImageUri);
    } catch (error) {
      console.error("Error in applyFilterToImage:", error);
      reject(error);
    }
  });
};
 */
