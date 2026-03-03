export const voidFieldVert = /* glsl */ `
varying vec2 vUv;
void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }
`;

export const voidFieldFrag = /* glsl */ `
precision highp float;
varying vec2 vUv;
uniform float uTime;
uniform float uIntensity;

float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7))) * 43758.5453123); }
float noise(vec2 p){
  vec2 i=floor(p), f=fract(p);
  float a=hash(i), b=hash(i+vec2(1,0)), c=hash(i+vec2(0,1)), d=hash(i+vec2(1,1));
  vec2 u=f*f*(3.0-2.0*f);
  return mix(a,b,u.x) + (c-a)*u.y*(1.0-u.x) + (d-b)*u.x*u.y;
}
float fbm(vec2 p){
  float v=0.0, a=0.5;
  for(int i=0;i<5;i++){ v+=a*noise(p); p*=2.02; a*=0.5; }
  return v;
}

void main(){
  vec2 p=(vUv-0.5)*2.0;
  float t=uTime*0.06;
  float n=fbm(p*1.4 + vec2(t,-t*0.7));
  float m=fbm(p*2.3 + vec2(-t*0.5,t*0.9));
  float v=smoothstep(0.0,1.0,n);
  float w=smoothstep(0.0,1.0,m);

  vec3 col=vec3(0.02,0.03,0.06);
  col += vec3(0.20,0.10,0.45) * v * (0.35 + 0.65*uIntensity);
  col += vec3(0.05,0.25,0.35) * w * (0.25 + 0.75*uIntensity);

  float vign=smoothstep(1.3,0.2,length(p));
  col *= vign;
  gl_FragColor=vec4(col,0.98);
}
`;
