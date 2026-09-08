export const oceanVertexShader = /* glsl */ `
  uniform float uTime;
  varying vec3 vNormal;
  varying vec3 vWorldPosition;

  // Sum of a few Gerstner-style waves traveling in different directions —
  // enough variety to avoid an obviously repeating surface.
  vec3 gerstner(vec2 direction, float steepness, float wavelength, vec2 position, float time, inout vec3 tangent, inout vec3 binormal) {
    float k = 6.28318 / wavelength;
    float c = sqrt(9.8 / k);
    vec2 d = normalize(direction);
    float f = k * (dot(d, position) - c * time);
    float a = steepness / k;

    tangent += vec3(
      -d.x * d.x * steepness * sin(f),
      d.x * steepness * cos(f),
      -d.x * d.y * steepness * sin(f)
    );
    binormal += vec3(
      -d.x * d.y * steepness * sin(f),
      d.y * steepness * cos(f),
      -d.y * d.y * steepness * sin(f)
    );

    return vec3(d.x * a * cos(f), a * sin(f), d.y * a * cos(f));
  }

  void main() {
    vec3 tangent = vec3(1.0, 0.0, 0.0);
    vec3 binormal = vec3(0.0, 0.0, 1.0);
    vec3 displaced = position;

    displaced += gerstner(vec2(1.0, 0.3), 0.32, 9.0, position.xz, uTime, tangent, binormal);
    displaced += gerstner(vec2(0.6, -0.8), 0.22, 5.4, position.xz, uTime, tangent, binormal);
    displaced += gerstner(vec2(-0.4, 0.9), 0.16, 3.1, position.xz, uTime * 1.15, tangent, binormal);
    displaced += gerstner(vec2(0.9, 0.15), 0.08, 1.6, position.xz, uTime * 1.4, tangent, binormal);

    vNormal = normalize(cross(binormal, tangent));

    vec4 worldPosition = modelMatrix * vec4(displaced, 1.0);
    vWorldPosition = worldPosition.xyz;
    gl_Position = projectionMatrix * viewMatrix * worldPosition;
  }
`;

export const oceanFragmentShader = /* glsl */ `
  uniform vec3 uSunDirection;
  uniform vec3 uSunColor;
  uniform vec3 uDeepColor;
  uniform vec3 uShallowColor;
  uniform vec3 uCameraPosition;

  varying vec3 vNormal;
  varying vec3 vWorldPosition;

  void main() {
    vec3 normal = normalize(vNormal);
    vec3 viewDirection = normalize(uCameraPosition - vWorldPosition);

    float fresnel = pow(1.0 - max(dot(normal, viewDirection), 0.0), 4.0);
    vec3 baseColor = mix(uDeepColor, uShallowColor, fresnel);

    vec3 halfVector = normalize(uSunDirection + viewDirection);
    float specular = pow(max(dot(normal, halfVector), 0.0), 120.0);

    vec3 color = baseColor + uSunColor * specular * 1.4;
    gl_FragColor = vec4(color, 1.0);
  }
`;

export const skyVertexShader = /* glsl */ `
  varying vec3 vWorldPosition;
  void main() {
    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
    vWorldPosition = worldPosition.xyz;
    gl_Position = projectionMatrix * viewMatrix * worldPosition;
  }
`;

export const skyFragmentShader = /* glsl */ `
  uniform vec3 uTopColor;
  uniform vec3 uHorizonColor;
  uniform vec3 uBottomColor;
  varying vec3 vWorldPosition;

  void main() {
    float height = normalize(vWorldPosition).y;
    float horizonMix = smoothstep(-0.05, 0.15, height);
    float topMix = smoothstep(0.1, 0.6, height);

    vec3 color = mix(uBottomColor, uHorizonColor, horizonMix);
    color = mix(color, uTopColor, topMix);

    gl_FragColor = vec4(color, 1.0);
  }
`;
