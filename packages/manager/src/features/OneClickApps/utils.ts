import type { OCA } from './types';

const OCA_MAPPING_REGEX = /[^A-Za-z0-9\s\/$*+\-?&.:()]/g;

interface Options {
  oneClickApps: OCA[];
  stackScriptLabel: string;
}

/**
 * Given a StackScript label, return the corresponding One-Click App name
 * @param oneClickApps
 * @param stackScriptLabel
 * @returns {string}
 */
export const mapStackScriptLabelToOCA = ({
  oneClickApps,
  stackScriptLabel,
}: Options): OCA | undefined => {
  return oneClickApps.find((app) => {
    const cleanedStackScriptLabel = stackScriptLabel
      .replace(OCA_MAPPING_REGEX, '')
      .trim();

    const cleanedAppName = app.name
      .replace('&reg;', '')
      .replace(OCA_MAPPING_REGEX, '');

    return cleanedStackScriptLabel === cleanedAppName;
  });
};
