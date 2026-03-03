export function isMobileDeviceHint(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent.toLowerCase();
  return /android|iphone|ipad|ipod|mobile/.test(ua);
}

export function chooseDPR(quality: "auto" | "low" | "high", fps: number, mobileHint: boolean): number {
  if (quality === "low") return mobileHint ? 1 : 1.25;
  if (quality === "high") return mobileHint ? 1.25 : 2;

  if (fps < 40) return mobileHint ? 1 : 1.25;
  if (fps < 55) return mobileHint ? 1.1 : 1.5;
  return mobileHint ? 1.25 : 1.75;
}
