export const einsteinWarpVert = /* glsl */ `
varying vec2 vUv;
uniform float uMass;
uniform float uWarp;
uniform float uScale;
uniform float uTime;

void main(){
  vUv = uv;
  vec3 pos = position;
  vec2 p = (uv - 0.5) * 2.0;
  float r = length(p) + 1e-4;
  float well = -uMass / r; // didáctico (no exacto)
  float ripples = sin((r*6.0) - uTime*0.4) * 0.03;
  pos.z += (well * 0.18 + ripples) * uWarp;
  pos.xy *= uScale;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos,1.0);
}
`;

export const einsteinWarpFrag = /* glsl */ `
precision highp float;
varying vec2 vUv;
uniform float uMass;
uniform float uWarp;

void main(){
  vec2 p = (vUv - 0.5) * 2.0;
  float r = length(p) + 1e-4;
  float g = uMass / r;

  vec3 base = vec3(0.01,0.02,0.04);
  vec3 glow = vec3(0.28,0.12,0.55) * (g * 0.25) * uWarp;
  vec3 cyan = vec3(0.05,0.25,0.32) * (smoothstep(1.2,0.0,r) * 0.35);

  float grid = abs(sin(p.x*12.0))*abs(sin(p.y*12.0));
  grid = smoothstep(0.96,1.0,grid) * 0.15;

  vec3 col = base + glow + cyan + vec3(grid);
  gl_FragColor = vec4(col,0.95);
}
`;
