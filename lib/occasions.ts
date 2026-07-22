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
    blurb: "for the fallen bags. we've all been there.",
    greet: (to) => `sorry about the rug ${to}`,
  },
};

export const OCCASION_LIST = Object.values(OCCASIONS);
