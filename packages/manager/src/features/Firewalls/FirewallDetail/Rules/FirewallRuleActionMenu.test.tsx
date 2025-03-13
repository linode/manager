import userEvent from '@testing-library/user-event';
import * as React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { FirewallRuleActionMenu } from './FirewallRuleActionMenu';

import type { FirewallRuleActionMenuProps } from './FirewallRuleActionMenu';

const props: FirewallRuleActionMenuProps = {
  disabled: false,
  handleCloneFirewallRule: vi.fn(),
  handleDeleteFirewallRule: vi.fn(),
  handleOpenRuleDrawerForEditing: vi.fn(),
  idx: 1,
};

describe('Firewall rule action menu', () => {
  it('should include the correct actions', async () => {
    const { getByText, queryByLabelText } = renderWithTheme(
      <FirewallRuleActionMenu {...props} />
    );

    const actionMenuButton = queryByLabelText(/^Action menu for/)!;

    await userEvent.click(actionMenuButton);

    for (const action of ['Edit', 'Clone', 'Delete']) {
      expect(getByText(action)).toBeVisible();
    }
  });
});
