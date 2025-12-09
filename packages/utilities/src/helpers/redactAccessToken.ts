export const redactAccessToken = (s: string) => {
  return s.replace(/access_token=[^&]+/g, 'access_token=REDACTED');
};
