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

export const checkForGravatar = async (url: string) => {
  try {
    const response = await fetch(url);

    if (response.status === 200) {
      return true;
    }
    if (response.status === 404) {
      return false;
    }
  } catch (error) {
    // The fetch to Gravatar failed. Event won't be logged.
  }
  return false;
};
