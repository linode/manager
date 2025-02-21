export const convertForAria = (str: string) => {
  return str
    .trim()
    .toLowerCase()
    .replace(/([^A-Z0-9]+)(.)/gi, (match, p1, p2) => p2.toUpperCase());
};
