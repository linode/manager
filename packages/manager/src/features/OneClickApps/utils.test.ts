import { oneClickAppFactory } from 'src/factories/stackscripts';

import { mapStackScriptLabelToOCA } from './utils';

describe('mapStackScriptLabelToOneClickAppName', () => {
  const onClickApp = oneClickAppFactory.build();

  it('should return undefined if no match is found', () => {
    const result = mapStackScriptLabelToOCA({
      oneClickApps: [],
      stackScriptLabel: '',
    });

    expect(result).toBeUndefined();
  });

  it('should return the matching app', () => {
    const result = mapStackScriptLabelToOCA({
      oneClickApps: [onClickApp],
      stackScriptLabel: 'Test App',
    });

    expect(result).toBeDefined();
  });

  it('should return the matching app when the StackScript label contains unexpected characters', () => {
    const onClickAppWithUnexpectedCharacters = oneClickAppFactory.build({
      name: 'Test @App &reg;',
    });

    const result = mapStackScriptLabelToOCA({
      oneClickApps: [onClickAppWithUnexpectedCharacters],
      stackScriptLabel: 'Test App',
    });

    expect(result).toBeDefined();
  });
});
