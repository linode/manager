const storageRegex = /([0-9])([kMGTPEZY]?i?[B])/;

function replaceFunc(match: string, p1: string, p2: string) {
  if (match.length === 0) return 'unknown';
  return `${p1} ${p2}`;
}

function formatStorageUnits(unformattedString: string | null) {
  const cleanedUnformattedString = unformattedString ?? 'unknown';
  if (!cleanedUnformattedString.match(storageRegex)) return 'unknown';
  return cleanedUnformattedString.replace(storageRegex, replaceFunc);
}

export { formatStorageUnits };
