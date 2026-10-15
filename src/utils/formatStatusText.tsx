export function formatStatusText(text: unknown) {
  const normalizedText =
    typeof text === "string" ? text : text == null ? "-" : String(text);

  return normalizedText
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}
