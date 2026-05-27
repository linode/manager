import { capitalizeAllWords } from '@akamai/compute-ui-core/formatting';

export const getFormattedStatus = (status: string): string => {
  return capitalizeAllWords(status.replace(/_/g, ' '));
};
