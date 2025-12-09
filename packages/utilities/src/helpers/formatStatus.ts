import { capitalizeAllWords } from './capitalize';

export const getFormattedStatus = (status: string): string => {
  return capitalizeAllWords(status.replace(/_/g, ' '));
};
