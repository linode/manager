import md5 from 'md5';
import { reportException } from 'src/exceptionReporting';

/**
 * Return the fingerprint of an SSH pubkey.
 * Defaults to md5 as that's what e.g. GitHub displays.
 *
 * Originally taken from https://github.com/bahamas10/node-ssh-fingerprint/blob/master/ssh-fingerprint.js
 * As of 8/20, replaced because the regex-based method does not handle ed25519 keys correctly.
 */
export function getSSHKeyFingerprint(pub: string) {
  try {
    const cleanpub = pub.split(' ')?.[1] ?? '';
    const pubbuffer = Uint8Array.from(atob(cleanpub), (c) => c.charCodeAt(0));
    const key = md5(pubbuffer);

    return colons(key);
  } catch (e) {
    reportException(`Error ${e} when parsing SSH pubkey: ${pub}`);
    return 'Error generating fingerprint';
  }
}

// add colons, 'hello' => 'he:ll:o'
const colons = (s: string) => {
  return s.replace(/(.{2})(?=.)/g, '$1:');
};
