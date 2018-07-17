import Axios from 'axios';
import * as md5 from 'md5';

export const getEmailHash = (email: string) => {
  return email && md5(email.trim().toLowerCase());
}

export const getGravatarUrl = (email: string): Promise<string> => {
  const url = `https://gravatar.com/avatar/${getEmailHash(email)}?d=404`;
  const instance = Axios.create();
  return instance.get(url)
    .then((response) => {
      if (response.config.url) {
        return response.config.url;
      } else {
        throw new Error('not found');
      }
    })
    .catch((error) => {
      return Promise.resolve('not found');
    });
}
