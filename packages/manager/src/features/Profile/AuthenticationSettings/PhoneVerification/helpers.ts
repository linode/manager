import { parsePhoneNumber } from 'libphonenumber-js';

export const getCountryFlag = (code: string) => {
  if (!code) {
    return code;
  }

  const OFFSET = 127397;

  if (code == 'XI') {
    return '🇬🇧';
  }
  if (code == 'LO') {
    return '🇮🇹';
  }
  if (code == 'LL') {
    return '🇨🇭';
  }
  if (code == 'DX') {
    return '🇧🇶';
  }
  return (
    String.fromCodePoint(code.charCodeAt(0) + OFFSET) +
    String.fromCodePoint(code.charCodeAt(1) + OFFSET)
  );
};

export const getCountryName = (name: string) =>
  name
    .split(' ')
    .map((w) => w[0].toUpperCase() + w.substring(1).toLowerCase())
    .join(' ');

export const getFormattedNumber = (phoneNumber: string) => {
  try {
    return parsePhoneNumber(phoneNumber).formatInternational();
  } catch (error) {
    return phoneNumber;
  }
};
