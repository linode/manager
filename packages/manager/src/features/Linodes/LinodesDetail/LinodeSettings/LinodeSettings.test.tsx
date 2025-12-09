import 'src/mocks/testServer';

import React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import LinodeSettings from './LinodeSettings';

const queryMocks = vi.hoisted(() => ({
  useFlags: vi.fn().mockReturnValue({}),
  useParams: vi.fn().mockReturnValue({}),
  userPermissions: vi.fn(() => ({
    data: {
      update_linode: false,
      delete_linode: false,
    },
  })),
}));

vi.mock('src/features/IAM/hooks/usePermissions', () => ({
  usePermissions: queryMocks.userPermissions,
}));

vi.mock('src/hooks/useFlags', () => {
  const actual = vi.importActual('src/hooks/useFlags');
  return {
    ...actual,
    useFlags: queryMocks.useFlags,
  };
});

vi.mock('@tanstack/react-router', async () => {
  const actual = await vi.importActual('@tanstack/react-router');
  return {
    ...actual,
    useParams: queryMocks.useParams,
  };
});

describe('LinodeSettings', () => {
  beforeEach(() => {
    queryMocks.useParams.mockReturnValue({
      linodeId: '1',
    });
  });

  it('should disable "Save" button for Linode Label if the user does not have update_linode permission', async () => {
    const { queryByText, queryByTestId } = renderWithTheme(<LinodeSettings />);

    expect(queryByText('Linode Label')).toBeVisible();

    const saveLabelBtn = queryByTestId('label-save');
    expect(saveLabelBtn).toBeInTheDocument();

    expect(saveLabelBtn).toHaveAttribute('aria-disabled', 'true');
  });
  it('should disable "Save" button for Host Maintenance Policy if the user does not have update_linode permission', async () => {
    queryMocks.useFlags.mockReturnValue({
      vmHostMaintenance: { enabled: true },
    });

    const { queryByText, queryByTestId } = renderWithTheme(<LinodeSettings />);

    expect(queryByText('Maintenance Policy')).toBeVisible();

    const saveLabelBtn = queryByTestId('label-save');
    expect(saveLabelBtn).toBeInTheDocument();

    expect(saveLabelBtn).toHaveAttribute('aria-disabled', 'true');
  });
  it('should disable "Save" button for Shutdown Watchdog if the user does not have update_linode permission', async () => {
    const { queryByText, getByTestId } = renderWithTheme(<LinodeSettings />);

    expect(queryByText('Shutdown Watchdog')).toBeVisible();

    const saveLabelBtn = getByTestId('watchdog-toggle');
    expect(saveLabelBtn).toBeInTheDocument();

    expect(saveLabelBtn).toHaveAttribute('aria-disabled', 'true');
  });
  it('should disable "Save" button for Delete Linode if the user does not have delete_linode permission', async () => {
    const { queryByText } = renderWithTheme(<LinodeSettings />);

    expect(queryByText('Delete Linode')).toBeVisible();

    const deleteBtn = queryByText('Delete');
    expect(deleteBtn).toBeInTheDocument();

    expect(deleteBtn).toHaveAttribute('aria-disabled', 'true');
  });

  it('should enable all buttons if the user has update_linode and delete_linode permissions', async () => {
    queryMocks.userPermissions.mockReturnValue({
      data: {
        update_linode: true,
        delete_linode: true,
      },
    });
    const { queryByText, getByLabelText, getByTestId } = renderWithTheme(
      <LinodeSettings />
    );

    const saveLabelBtn = getByLabelText('Label');
    expect(saveLabelBtn).toBeInTheDocument();
    expect(saveLabelBtn).not.toHaveAttribute('aria-disabled', 'true');

    const saveToggle = getByTestId('watchdog-toggle');
    expect(saveToggle).toBeInTheDocument();
    expect(saveToggle).not.toHaveAttribute('aria-disabled', 'true');

    const deleteBtn = queryByText('Delete');
    expect(deleteBtn).toBeInTheDocument();
    expect(deleteBtn).not.toHaveAttribute('aria-disabled', 'true');
  });
});
