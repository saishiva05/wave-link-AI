// Maps internal platform keys to public-facing WaveLynk brand names
// This ensures users never see source platform names (LinkedIn, JSearch, etc.)

const platformNameMap: Record<string, string> = {
  linkedin: "WaveLynk Max",
  jsearch: "WaveLynk Pro",
};

export const getPlatformDisplayName = (platform: string): string => {
  return platformNameMap[platform.toLowerCase()] || "WaveLynk";
};
