import userEvent from '@testing-library/user-event';
import React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { AppSelectionCard } from './AppSelectionCard';

const queryMocks = vi.hoisted(() => ({
  userPermissions: vi.fn(() => ({
    data: {
      create_linode: true,
    },
  })),
}));
vi.mock('src/features/IAM/hooks/usePermissions', () => ({
  usePermissions: queryMocks.userPermissions,
}));

describe('AppSelectionCard', () => {
  it('Should render an a label', () => {
    const { getByText } = renderWithTheme(
      <AppSelectionCard
        checked={false}
        iconUrl={''}
        label="MySQL"
        onOpenDetailsDrawer={vi.fn()}
        onSelect={vi.fn()}
      />
    );

    expect(getByText('MySQL')).toBeVisible();
  });

  it('should call `onSelect` when clicked', async () => {
    const onSelect = vi.fn();
    const { getByText } = renderWithTheme(
      <AppSelectionCard
        checked={false}
        iconUrl={''}
        label="MySQL"
        onOpenDetailsDrawer={vi.fn()}
        onSelect={onSelect}
      />
    );

    await userEvent.click(getByText('MySQL'));

    expect(onSelect).toHaveBeenCalled();
  });

  it('should call `onOpenDetailsDrawer` when info is clicked', async () => {
    const onSelect = vi.fn();
    const onOpenDetailsDrawer = vi.fn();

    const { getByLabelText } = renderWithTheme(
      <AppSelectionCard
        checked={false}
        iconUrl={''}
        label="MySQL"
        onOpenDetailsDrawer={onOpenDetailsDrawer}
        onSelect={onSelect}
      />
    );

    await userEvent.click(getByLabelText('Info for "MySQL"'));

    expect(onOpenDetailsDrawer).toHaveBeenCalled();
    expect(onSelect).not.toHaveBeenCalled();
  });

  it('should enable the card when user has create_linode permission', async () => {
    const { getByTestId } = renderWithTheme(
      <AppSelectionCard
        checked={false}
        iconUrl={''}
        label="MySQL"
        onOpenDetailsDrawer={vi.fn()}
        onSelect={vi.fn()}
      />
    );

    expect(getByTestId('selection-card')).toBeEnabled();
  });

  it('should disable the card when user does not have create_linode permission', async () => {
    queryMocks.userPermissions.mockReturnValue({
      data: {
        create_linode: false,
      },
    });

    const { getByTestId } = renderWithTheme(
      <AppSelectionCard
        checked={false}
        iconUrl={''}
        label="MySQL"
        onOpenDetailsDrawer={vi.fn()}
        onSelect={vi.fn()}
      />
    );

    expect(getByTestId('selection-card')).toBeDisabled();
  });
});
