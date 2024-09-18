import { fireEvent } from '@testing-library/react';
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
        'Enable passive checks based on observing communication with back-end nodes.'
      )
    ).toBeVisible();
  });

  it('calls onCheckPassiveChange when the check is toggled', () => {
    const { getByLabelText } = renderWithTheme(
      <PassiveCheck {...nbConfigPanelMockPropsForTest} />
    );

    const passiveChecksToggle = getByLabelText('Passive Checks');
    expect(passiveChecksToggle).toBeInTheDocument();

    fireEvent.click(passiveChecksToggle);
    expect(
      nbConfigPanelMockPropsForTest.onCheckPassiveChange
    ).toHaveBeenCalled();
  });
});
