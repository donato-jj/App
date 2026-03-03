export function clamp01(x: number) {
  return Math.max(0, Math.min(1, x));
}
export function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}
export function smoothstep(edge0: number, edge1: number, x: number) {
  const t = clamp01((x - edge0) / (edge1 - edge0));
  return t * t * (3 - 2 * t);
}
