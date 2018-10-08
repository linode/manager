// Validates password based on the following documentation:
//
// password (required): string [ 6 .. 128 ] characters
// The new root password for the OS installed on this Disk.
// The password must contain at least two of these four character classes:
//
// - lowercase letters
// - uppercase letters
// - numbers
// - punctuation
//
// (https://developers.dev.linode.com/api/v4#operation/resetDiskPassword)
interface ValidationResponse {
  isValid: boolean;
  message?: string;
}

export const validateLinodeDiskPassword = (password: string): ValidationResponse => {

  if (password.length < 8) {
    return { isValid: false, message: 'Password must be 8 characters or more' };
  }

  if (password.length > 128) {
    return { isValid: false, message: 'Password must be 128 characters or less' };
  }

  // Create an array of regular expressions to loop through, since we need to match a specific number of cases.
  const characterCasesRe: RegExp[] = [
    /[a-z]/, // lowercase character
    /[A-Z]/, // uppercase character
    /\d/, // number
    /[!@#$%^&*()\/=?_.,:;-]/ // punctuation
  ];

  let numMatches: number = 0;

  characterCasesRe.forEach((re: RegExp) => {
    if ((password.match(re) || []).length > 0) {
      numMatches++;
    }
  });

  // Must match two of four conditions
  if (numMatches < 2) {
    return { isValid: false, message: 'Password must contain at least 2 of these 4 character classes: lowercase letters, uppercase letters, numbers, or punctuation' };
  }

  return { isValid: true };
}