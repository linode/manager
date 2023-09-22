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
    const cleanedStackScriptLabel = stackScriptLabel.replace(/\W/g, '').trim();

    const cleanedAppName = app.name.replace('&reg;', '').replace(/\W/g, '');

    return cleanedStackScriptLabel === cleanedAppName;
  });
};
