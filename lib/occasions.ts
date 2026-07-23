export type OccasionKey =
  | "birthday"
  | "congrats"
  | "holidays"
  | "justbecause"
  | "thankyou";

export interface Occasion {
  key: OccasionKey;
  label: string;
  tag: string;
  emoji: string;
  /** two-stop bold gradient for the card base */
  c1: string;
  c2: string;
  /** distinct per-occasion holographic band palette */
  holo: string[];
  blurb: string;
  greet: (to: string) => string;
}

export const OCCASIONS: Record<OccasionKey, Occasion> = {
  birthday: {
    key: "birthday",
    label: "Birthday",
    tag: "BIRTHDAY",
    emoji: "🎂",
    c1: "#FF3D8B",
    c2: "#7A5BFF",
    holo: ["#ff2d9a", "#ff7ac6", "#c74bd1", "#9b6bff", "#ff2d9a"],
    blurb: "A little something to celebrate your day.",
    greet: (to) => `Happy birthday, ${to}`,
  },
  congrats: {
    key: "congrats",
    label: "Congratulations",
    tag: "CONGRATS",
    emoji: "🏆",
    c1: "#FF6A1F",
    c2: "#FF3D8B",
    holo: ["#ffcf3d", "#ffb020", "#ff7a00", "#ff3d6a", "#ffcf3d"],
    blurb: "Here's to your big moment — well earned.",
    greet: (to) => `Congratulations, ${to}`,
  },
  holidays: {
    key: "holidays",
    label: "Holidays",
    tag: "HOLIDAYS",
    emoji: "❄️",
    c1: "#34C8FF",
    c2: "#7A5BFF",
    holo: ["#8becff", "#22e0ff", "#3b9eff", "#8b5cff", "#8becff"],
    blurb: "Warm wishes for the season.",
    greet: (to) => `Happy holidays, ${to}`,
  },
  justbecause: {
    key: "justbecause",
    label: "Just because",
    tag: "JUST BECAUSE",
    emoji: "💛",
    c1: "#C8FF3D",
    c2: "#34C8FF",
    holo: ["#dfff6a", "#bfff3a", "#46ff8f", "#22e0ff", "#bfff3a"],
    blurb: "No occasion needed — just thinking of you.",
    greet: (to) => `Thinking of you, ${to}`,
  },
  thankyou: {
    key: "thankyou",
    label: "Thank you",
    tag: "THANK YOU",
    emoji: "🙏",
    c1: "#F2B84B",
    c2: "#E8685C",
    holo: ["#ffd76a", "#ffbf3a", "#ff9a4a", "#ff7a6a", "#ffbf3a"],
    blurb: "A small thank-you for something big.",
    greet: (to) => `Thank you, ${to}`,
  },
};

export const OCCASION_LIST = Object.values(OCCASIONS);
