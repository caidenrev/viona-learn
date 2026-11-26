export type PlaylistNoteColor = "PINK" | "BUTTER" | "MINT" | "LAV";

export function playlistColorToRibbon(
  color?: PlaylistNoteColor | string | null
): "pink" | "lilac" | "butter" | "mint" {
  switch (color) {
    case "BUTTER":
      return "butter";
    case "MINT":
      return "mint";
    case "LAV":
      return "lilac";
    case "PINK":
    default:
      return "pink";
  }
}

export function playlistColorToTape(
  color?: PlaylistNoteColor | string | null
): "pink" | "yellow" | "mint" | "lilac" {
  switch (color) {
    case "BUTTER":
      return "yellow";
    case "MINT":
      return "mint";
    case "LAV":
      return "lilac";
    case "PINK":
    default:
      return "pink";
  }
}

export const PLAYLIST_COLOR_OPTIONS: {
  value: PlaylistNoteColor;
  label: string;
}[] = [
  { value: "PINK", label: "Sakura Pink" },
  { value: "LAV", label: "Pastel Lilac" },
  { value: "BUTTER", label: "Butter Yellow" },
  { value: "MINT", label: "Mint Sky" },
];
