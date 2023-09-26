import type { OCA } from './types';

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
      .replace(/[^A-Za-z0-9\s\/$*+\-?&.:()]/g, '')
      .trim();

    const cleanedAppName = app.name
      .replace('&reg;', '')
      .replace(/[^A-Za-z0-9\s\/$*+\-?&.:()]/g, '');

    return cleanedStackScriptLabel === cleanedAppName;
  });
};
