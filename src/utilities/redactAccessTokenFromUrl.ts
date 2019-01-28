import * as URL from 'url-parse';

export default (url: string): string => {
  const u = URL(url);
  const updatedHash = u.hash
    .split('#')
    .map(chunk =>
      chunk
        .split('&')
        .map(query => {
          const access_token = query.includes('access_token');
          return access_token ? `access_token=REDACTED` : query;
        })
        .join('&')
    )
    .join('#');

  return u.set('hash', updatedHash).toString();
};
