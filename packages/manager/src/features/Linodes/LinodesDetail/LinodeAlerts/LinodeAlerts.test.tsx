import 'src/mocks/testServer';

import { waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import LinodeAlerts from './LinodeAlerts';

const queryMocks = vi.hoisted(() => ({
  userPermissions: vi.fn(() => ({
    data: {
      update_linode: false,
    },
  })),
  useParams: vi.fn().mockReturnValue({ linodeId: '1' }),
}));

vi.mock('src/features/IAM/hooks/usePermissions', () => ({
  usePermissions: queryMocks.userPermissions,
}));

vi.mock('@linode/queries', async () => {
  const actual = await vi.importActual('@linode/queries');
  return {
    ...actual,
  };
});

vi.mock('@tanstack/react-router', async () => {
  const actual = await vi.importActual('@tanstack/react-router');
  return {
    ...actual,
    useParams: queryMocks.useParams,
  };
});

describe('LinodeAlerts', () => {
  it('should render component', async () => {
    const { getByText } = renderWithTheme(<LinodeAlerts />);

    expect(getByText('Alerts')).toBeVisible();
    expect(getByText('CPU Usage')).toBeVisible();
    expect(getByText('Outbound Traffic')).toBeVisible();
    expect(getByText('Transfer Quota')).toBeVisible();
  });

  it('should disable "Save" button if the user does not have update_linode permission', async () => {
    const { getByTestId } = renderWithTheme(<LinodeAlerts />);

    const saveBtn = getByTestId('alerts-save');
    expect(saveBtn).toBeInTheDocument();
    expect(saveBtn).toHaveAttribute('aria-disabled', 'true');
  });

  it('should enable "Save" button if the user has update_linode permission', async () => {
    queryMocks.userPermissions.mockReturnValue({
      data: {
        update_linode: true,
      },
    });
    const { getByTestId, getAllByTestId } = renderWithTheme(<LinodeAlerts />);

    const inputCPU = getAllByTestId('textfield-input')[0];
    expect(inputCPU).toBeInTheDocument();

    const saveBtn = getByTestId('alerts-save');
    expect(saveBtn).toBeInTheDocument();

    await waitFor(async () => {
      await userEvent.type(inputCPU, '20');
      expect(saveBtn).not.toHaveAttribute('aria-disabled', 'true');
    });
  });
});
