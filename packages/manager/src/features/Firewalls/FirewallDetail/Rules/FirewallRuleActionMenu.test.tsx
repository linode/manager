import * as React from 'react';

import { includesActions, renderWithTheme } from 'src/utilities/testHelpers';

import FirewallRuleActionMenu, { Props } from './FirewallRuleActionMenu';

jest.mock('src/components/ActionMenu/ActionMenu');

const props: Props = {
  disabled: false,
  idx: 1,
  triggerCloneFirewallRule: jest.fn(),
  triggerDeleteFirewallRule: jest.fn(),
  triggerOpenRuleDrawerForEditing: jest.fn(),
};

describe('Firewall rule action menu', () => {
  it('should include the correct actions', () => {
    const { queryByText } = renderWithTheme(
      <FirewallRuleActionMenu {...props} />
    );
    includesActions(['Edit', 'Clone', 'Delete'], queryByText);
  });
});
