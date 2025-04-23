import userEvent from '@testing-library/user-event';
import * as React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { nbConfigPanelMockPropsForTest } from './NodeBalancerConfigPanel.test';
import { PassiveCheck } from './NodeBalancerPassiveCheck';

describe('NodeBalancer PassiveCheck', () => {
  it('renders the passive check', () => {
    const { getAllByText, getByText } = renderWithTheme(
      <PassiveCheck {...nbConfigPanelMockPropsForTest} />
    );

    expect(getAllByText('Passive Checks')).toHaveLength(2);
    expect(
      getByText(
        'When enabled, the NodeBalancer monitors requests to backends.',
        { exact: false }
      )
    ).toBeVisible();
  });

  it('calls onCheckPassiveChange when the check is toggled', async () => {
    const { getByLabelText } = renderWithTheme(
      <PassiveCheck {...nbConfigPanelMockPropsForTest} />
    );

    const passiveChecksToggle = getByLabelText('Passive Checks');
    expect(passiveChecksToggle).toBeInTheDocument();

    await userEvent.click(passiveChecksToggle);
    expect(
      nbConfigPanelMockPropsForTest.onCheckPassiveChange
    ).toHaveBeenCalled();
  });
});
