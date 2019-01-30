const { VERSION } = process.env;

export const getVersionString = () =>
  VERSION ? `Cloud Manager Version: ${VERSION}` : '';
