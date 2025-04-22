export const convertForAria = (str: string) => {
  return (
    str
      .trim()
      .toLowerCase()
      // eslint-disable-next-line sonarjs/slow-regex
      .replace(/([^A-Z0-9]+)(.)/gi, (match, p1, p2) => p2.toUpperCase())
  );
};
