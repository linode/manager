// eslint-disable-next-line sonarjs/single-char-in-character-classes
const storageRegex = /([0-9])([kMGTPEZY]?i?[B])/;
const labelPrefixRegex = /^(DBaaS).+- /;

function replaceFunc(match: string, p1: string, p2: string) {
  return `${p1} ${p2}`;
}

function formatStorageUnits(unformattedString: string) {
  if (unformattedString.match(labelPrefixRegex)) {
    unformattedString = unformattedString.replace(labelPrefixRegex, '');
  }

  if (!unformattedString.match(storageRegex)) {
    return unformattedString;
  }

  return unformattedString.replace(storageRegex, replaceFunc);
}

export { formatStorageUnits };
