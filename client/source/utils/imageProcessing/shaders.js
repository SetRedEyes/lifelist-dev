export const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position, 1.0);
  }
`;

export const fragmentShader = `
  uniform sampler2D uTexture;
  uniform float uTime;
  varying vec2 vUv;

  float random(vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
  }

  float vignette(vec2 uv) {
    float d = distance(uv, vec2(0.5));
    return smoothstep(0.8, 0.5, d);
  }

  void main() {
    vec4 color = texture2D(uTexture, vUv);

    // Disposable camera effects
    color.r *= 1.2;
    color.g *= 1.1;
    color.b *= 0.9;

    // Grain effect
    color.rgb += random(vUv + uTime * 0.1) * 0.05;

    // Vignette
    color.rgb *= vignette(vUv);

    gl_FragColor = color;
  }
`;

/* import { Shaders, GLSL } from "gl-react";

export const shaders = Shaders.create({
  LUT: {
    frag: GLSL`
      precision highp float;
      varying vec2 uv;
      uniform sampler2D inputImageTexture;
      uniform sampler2D lutTexture;

      void main() {
        vec4 originalColor = texture2D(inputImageTexture, uv);
        float blueColor = originalColor.b * 124.0;
        vec2 quad1;
        vec2 quad2;
        quad1.y = floor(floor(blueColor) / 25.0);
        quad1.x = floor(blueColor) - (quad1.y * 25.0);
        quad2.y = floor(ceil(blueColor) / 25.0);
        quad2.x = ceil(blueColor) - (quad2.y * 25.0);

        vec2 texPos1;
        texPos1.x = (quad1.x * 5.0 + originalColor.r * 4.0) / 125.0;
        texPos1.y = (quad1.y * 5.0 + originalColor.g * 4.0) / 125.0;

        vec2 texPos2;
        texPos2.x = (quad2.x * 5.0 + originalColor.r * 4.0) / 125.0;
        texPos2.y = (quad2.y * 5.0 + originalColor.g * 4.0) / 125.0;

        vec4 newColor1 = texture2D(lutTexture, texPos1);
        vec4 newColor2 = texture2D(lutTexture, texPos2);
        vec4 newColor = mix(newColor1, newColor2, fract(blueColor));
        gl_FragColor = vec4(newColor.rgb, originalColor.a);
      }
    `,
  },
});
 */
