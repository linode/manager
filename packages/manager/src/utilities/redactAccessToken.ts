const redactAccessToken = (s: string) => {
  return s.replace(/access_token=[a-zA-Z0-9]+/g, 'access_token=REDACTED');
};

export default redactAccessToken;
