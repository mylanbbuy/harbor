export const C = {
  bg: "#0A0D12",
  bgElevated: "#10151D",
  bgCard: "#131A24",
  line: "rgba(255,255,255,0.08)",
  lineStrong: "rgba(255,255,255,0.16)",
  white: "#F4F6F9",
  dim: "#8B96A5",
  dimmer: "#5C6675",
  blue: "#2F6FED",
  blueBright: "#5CA8FF",
  cyan: "#3EE0D0",
};

export const money = (n) => "TZS " + Number(n || 0).toLocaleString("en-US");

export const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "255700000000";
export const CONTACT_EMAIL = process.env.NEXT_PUBLIC_CONTACT_EMAIL || "info@harbor.co.tz";
export const CONTACT_PHONE = process.env.NEXT_PUBLIC_CONTACT_PHONE || "+255 700 000 000";
