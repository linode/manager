import * as crypto from 'crypto';
import { reportException } from 'src/exceptionReporting';

export default (pub: string, alg: string = 'md5') => {
  try {
    const cleanpub = pub.split(' ')?.[1] ?? '';
    const pubbuffer = Buffer.from(cleanpub, 'base64');
    const key = hash(pubbuffer, alg);

    return colons(key);
  } catch (e) {
    reportException(`Error ${e} when parsing SSH pubkey: ${pub}`);
    return 'Error generating fingerprint';
  }
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
