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
  isRuleSet: false,
  idx: 1,
};

describe('Firewall rule action menu', () => {
  it('should include the correct actions', async () => {
    const { getByText, queryByLabelText } = renderWithTheme(
      <FirewallRuleActionMenu {...props} />
    );

    const actionMenuButton = queryByLabelText(/^Action menu for/)!;

    await userEvent.click(actionMenuButton);

    // "Edit", "Clone" and "Delete" are all visible and enabled
    for (const action of ['Edit', 'Clone', 'Delete']) {
      expect(getByText(action)).toBeVisible();
    }
  });

  it('should include the correct actions when Firewall rules row is a RuleSet', async () => {
    const { getByText, queryByText, queryByLabelText, findByRole } =
      renderWithTheme(<FirewallRuleActionMenu {...props} isRuleSet={true} />);

    const actionMenuButton = queryByLabelText(/^Action menu for/)!;

    await userEvent.click(actionMenuButton);

    // "Edit" is visible but disabled, "Clone" is not present, and "Delete" is visible and enabled
    for (const action of ['Edit', 'Delete']) {
      expect(getByText(action)).toBeVisible();
    }
    expect(queryByText('Clone')).toBeNull();

    expect(getByText('Edit')).toBeDisabled();
    expect(getByText('Delete')).toBeEnabled();

    // Hover over "Edit" and assert tooltip text
    const editButton = getByText('Edit');
    await userEvent.hover(editButton);
    const tooltip = await findByRole('tooltip');
    expect(tooltip).toHaveTextContent(
      'Edit your custom Rule Set\u2019s label, description, or rules, using the API. Rule Sets that are defined by a managed-service can only be updated by service accounts.'
    );
  });
});
