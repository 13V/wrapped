export type OccasionKey =
  | "birthday"
  | "congrats"
  | "holidays"
  | "justbecause"
  | "rugged";

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
    label: "birthday",
    tag: "BDAY",
    emoji: "🎂",
    c1: "#FF3D8B",
    c2: "#7A5BFF",
    holo: ["#ff2d9a", "#ff7ac6", "#c74bd1", "#9b6bff", "#ff2d9a"],
    blurb: "another year, another bag secured.",
    greet: (to) => `happy bday ${to}`,
  },
  congrats: {
    key: "congrats",
    label: "congrats",
    tag: "GG",
    emoji: "🏆",
    c1: "#FF6A1F",
    c2: "#FF3D8B",
    holo: ["#ffcf3d", "#ffb020", "#ff7a00", "#ff3d6a", "#ffcf3d"],
    blurb: "big W energy. mark the moment.",
    greet: (to) => `congrats ${to}`,
  },
  holidays: {
    key: "holidays",
    label: "holidays",
    tag: "XMAS",
    emoji: "❄️",
    c1: "#34C8FF",
    c2: "#7A5BFF",
    holo: ["#8becff", "#22e0ff", "#3b9eff", "#8b5cff", "#8becff"],
    blurb: "the whole group chat, sorted.",
    greet: (to) => `happy holidays ${to}`,
  },
  justbecause: {
    key: "justbecause",
    label: "just because",
    tag: "JBC",
    emoji: "💚",
    c1: "#C8FF3D",
    c2: "#34C8FF",
    holo: ["#dfff6a", "#bfff3a", "#46ff8f", "#22e0ff", "#bfff3a"],
    blurb: "no reason. the best reason.",
    greet: (to) => `thinking of you ${to}`,
  },
  rugged: {
    key: "rugged",
    label: "you got rugged",
    tag: "RIP",
    emoji: "🫡",
    c1: "#7A5BFF",
    c2: "#34C8FF",
    holo: ["#b39bff", "#9b6bff", "#6a5bff", "#3b9eff", "#9b6bff"],
    blurb: "for the fallen bags. we've all been there.",
    greet: (to) => `sorry about the rug ${to}`,
  },
};

export const OCCASION_LIST = Object.values(OCCASIONS);
