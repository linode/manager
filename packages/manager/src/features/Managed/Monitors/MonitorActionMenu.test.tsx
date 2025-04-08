import userEvent from '@testing-library/user-event';
import * as React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { MonitorActionMenu } from './MonitorActionMenu';

import type { MonitorActionMenuProps } from './MonitorActionMenu';

const props: MonitorActionMenuProps = {
  label: 'this-monitor',
  monitorId: 1,
  status: 'disabled',
};

describe('Monitor action menu', () => {
  it('should include basic Monitor actions', async () => {
    const { getByLabelText, getByText } = renderWithTheme(
      <MonitorActionMenu {...props} status="disabled" />
    );

    const actionMenuButton = getByLabelText(
      `Action menu for Monitor ${props.label}`
    );

    await userEvent.click(actionMenuButton);

    for (const action of ['View Issue History', 'Edit', 'Delete']) {
      expect(getByText(action)).toBeVisible();
    }
  });

  it('should include Enable if the monitor is disabled', async () => {
    const { getByLabelText, getByText, queryByText } = renderWithTheme(
      <MonitorActionMenu {...props} status="disabled" />
    );

    const actionMenuButton = getByLabelText(
      `Action menu for Monitor ${props.label}`
    );

    await userEvent.click(actionMenuButton);

    expect(getByText('Enable')).toBeVisible();
    expect(queryByText('Disable')).toBeNull();
  });

  it('should include Disable if the monitor is enabled', async () => {
    const { getByLabelText, getByText, queryByText } = renderWithTheme(
      <MonitorActionMenu {...props} status="ok" />
    );

    const actionMenuButton = getByLabelText(
      `Action menu for Monitor ${props.label}`
    );

    await userEvent.click(actionMenuButton);

    expect(getByText('Disable')).toBeVisible();
    expect(queryByText('Enable')).toBeNull();
  });
});
