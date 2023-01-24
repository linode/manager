import md5 from 'md5';

export const getEmailHash = (email: string) => {
  return email && md5(email.trim().toLowerCase());
};

export const getGravatarUrlFromHash = (hash: string): string => {
  return `https://gravatar.com/avatar/${hash}?d=404`;
};

export const getGravatarUrl = (email: string): string => {
  return getGravatarUrlFromHash(getEmailHash(email));
};
