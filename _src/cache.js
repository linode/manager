import md5 from 'md5';

const emailHashes = {};
export function getEmailHash(email) {
  const emailHash = emailHashes[email];
  if (emailHash) {
    return emailHash;
  }

  emailHashes[email] = md5(email.trim().toLowerCase());
  return emailHashes[email];
}
