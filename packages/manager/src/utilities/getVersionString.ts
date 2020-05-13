const { VERSION } = process.env;

export const getVersionString = () =>
  VERSION ? `Cloud Manager Version: ${VERSION}` : '';

export const versionStringRegex = /Cloud Manager Version: [0-9.]+$/g;
