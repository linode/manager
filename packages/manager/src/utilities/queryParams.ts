/**
 * Parses a string of key/value pairs separated by '&', with the key and value separated by '='
 *
 * @param str The string to parse
 * @returns An object of the parsed key/value pairs
 */
export const parseQueryParams = (str: string) =>
  Object.fromEntries(new URLSearchParams(str));

export const getQueryParam = (
  str: string,
  paramName: string,
  defaultValue: string = ''
) => {
  const params = parseQueryParams(str);
  return params[paramName] ?? defaultValue;
};

export const getParamsFromUrl = (url: string) => {
  return parseQueryParams(url);
};

export const getParamFromUrl = (
  url: string,
  paramName: string,
  defaultValue: string = ''
): string => {
  return getQueryParam(url, paramName, defaultValue);
};
