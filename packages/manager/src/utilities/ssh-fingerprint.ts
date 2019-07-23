import * as crypto from 'crypto';

const pubre = /^(ssh-[dr]s[as]\s+)|(\s+.+)|\n/g;

export default (pub: string, alg: string = 'md5') => {
  const cleanpub = pub.replace(pubre, '');
  const pubbuffer = new Buffer(cleanpub, 'base64');
  const key = hash(pubbuffer, alg);

  return colons(key);
};

// hash a string with the given alg
const hash = (s: Buffer, alg: string) => {
  return crypto
    .createHash(alg)
    .update(s)
    .digest('hex');
};

// add colons, 'hello' => 'he:ll:o'
const colons = (s: string) => {
  return s.replace(/(.{2})(?=.)/g, '$1:');
};
