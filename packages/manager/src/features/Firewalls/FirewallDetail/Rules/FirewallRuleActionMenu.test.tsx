import * as React from 'react';

import { includesActions, renderWithTheme } from 'src/utilities/testHelpers';

import {
  FirewallRuleActionMenu,
  FirewallRuleActionMenuProps,
} from './FirewallRuleActionMenu';

vi.mock('src/components/ActionMenu/ActionMenu');

const props: FirewallRuleActionMenuProps = {
  disabled: false,
  idx: 1,
  triggerCloneFirewallRule: vi.fn(),
  triggerDeleteFirewallRule: vi.fn(),
  triggerOpenRuleDrawerForEditing: vi.fn(),
};

describe('Firewall rule action menu', () => {
  it('should include the correct actions', () => {
    const { queryByText } = renderWithTheme(
      <FirewallRuleActionMenu {...props} />
    );
    includesActions(['Edit', 'Clone', 'Delete'], queryByText);
  });
});
