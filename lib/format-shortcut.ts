export function formatShortcut(chord: string, isMac: boolean): string {
  const tokens = chord.split("-");

  const toMacGlyph = (token: string): string => {
    switch (token) {
      case "Mod":
        return "\u2318"; // ⌘
      case "Shift":
        return "\u21E7"; // ⇧
      case "Alt":
      case "Option":
        return "\u2325"; // ⌥
      case "Ctrl":
        return "\u2303"; // ⌃
      default:
        return token.toUpperCase();
    }
  };

  const toNonMacSpelled = (token: string): string => {
    switch (token) {
      case "Mod":
      case "Ctrl":
        return "Ctrl";
      case "Shift":
        return "Shift";
      case "Alt":
      case "Option":
        return "Alt";
      default:
        return token.toUpperCase();
    }
  };

  if (isMac) {
    return tokens.map(toMacGlyph).join("");
  }

  return tokens.map(toNonMacSpelled).join("+");
}
