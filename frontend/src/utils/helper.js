export function nameInitials(name) {
  const parts = name.split(" ");
  if (parts.length === 1) {
    return `${parts[0][0]}`;
  } else if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`;
  }
  return "";
}

export function properCase(str) {
  return str
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}
