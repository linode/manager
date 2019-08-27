const { VERSION } = process.env;

export const getVersionString = () =>
  VERSION
    ? `<span class="version">Cloud Manager Version: ${VERSION}</span>`
    : '';
