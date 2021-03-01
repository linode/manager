import * as React from 'react';
import FirewallRuleActionMenu, { Props } from './FirewallRuleActionMenu';

import { includesActions, renderWithTheme } from 'src/utilities/testHelpers';

jest.mock('src/components/ActionMenu/ActionMenu');

const props: Props = {
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
