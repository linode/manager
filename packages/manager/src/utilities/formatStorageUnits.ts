const storageRegex = /([0-9])([kMGTPEZY]?i?[B])/;

function replaceFunc(match: string, p1: string, p2: string) {
  return `${p1} ${p2}`;
}

function formatStorageUnits(unformattedString: string) {
  const cleanedUnformattedString = `${unformattedString}`;
  if (!cleanedUnformattedString.match(storageRegex)) {
    return unformattedString;
  }
  return cleanedUnformattedString.replace(storageRegex, replaceFunc);
}

export { formatStorageUnits };
