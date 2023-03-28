import { vi } from 'vitest';
import * as React from 'react';
import FirewallRuleActionMenu, { Props } from './FirewallRuleActionMenu';

import { includesActions, renderWithTheme } from 'src/utilities/testHelpers';

vi.mock('src/components/ActionMenu/ActionMenu');

const props: Props = {
  idx: 1,
  disabled: false,
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
