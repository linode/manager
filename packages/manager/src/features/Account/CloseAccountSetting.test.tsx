import { profileFactory } from '@linode/utilities';
import { fireEvent, waitFor } from '@testing-library/react';
import * as React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import CloseAccountSetting from './CloseAccountSetting';
import {
  CHILD_USER_CLOSE_ACCOUNT_TOOLTIP_TEXT,
  PARENT_USER_CLOSE_ACCOUNT_TOOLTIP_TEXT,
  PROXY_USER_CLOSE_ACCOUNT_TOOLTIP_TEXT,
} from './constants';

// Mock the useProfile hook to immediately return the expected data, circumventing the HTTP request and loading state.
const queryMocks = vi.hoisted(() => ({
  useProfile: vi.fn().mockReturnValue({}),
  userPermissions: vi.fn(() => ({
    data: { cancel_account: true },
  })),
}));

vi.mock('src/features/IAM/hooks/usePermissions', () => ({
  usePermissions: queryMocks.userPermissions,
}));
vi.mock('@linode/queries', async () => {
  const actual = await vi.importActual('@linode/queries');
  return {
    ...actual,
    useProfile: queryMocks.useProfile,
  };
});

describe('Close Account Settings', () => {
  it('should render a heading and button', () => {
    const { getAllByText } = renderWithTheme(<CloseAccountSetting />);
    expect(getAllByText('Close Account')).toHaveLength(2);
  });

  it('should render a Close Account Button', () => {
    queryMocks.useProfile.mockReturnValue({
      data: profileFactory.build({ user_type: 'default' }),
    });

    const { getByTestId } = renderWithTheme(<CloseAccountSetting />);
    const button = getByTestId('close-account-button');
    expect(button).toBeInTheDocument();
    expect(button).toBeEnabled();
    expect(button).toHaveTextContent('Close Account');
  });

  it('should render a disabled Close Account button with tooltip for a parent account user', async () => {
    queryMocks.useProfile.mockReturnValue({
      data: profileFactory.build({ user_type: 'parent' }),
    });

    const { getByRole, getByTestId, getByText } = renderWithTheme(
      <CloseAccountSetting />
    );
    const button = getByTestId('close-account-button');
    fireEvent.mouseOver(button);

    await waitFor(() => {
      expect(getByRole('tooltip')).toBeInTheDocument();
    });

    expect(getByText(PARENT_USER_CLOSE_ACCOUNT_TOOLTIP_TEXT)).toBeVisible();
    expect(button).toHaveAttribute('aria-describedby', 'button-tooltip');
    expect(button).not.toHaveAttribute('disabled');
    expect(button).toHaveAttribute('aria-disabled', 'true');
  });

  it('should render a disabled Close Account button with tooltip for a child account user', async () => {
    queryMocks.useProfile.mockReturnValue({
      data: profileFactory.build({ user_type: 'child' }),
    });

    const { getByRole, getByTestId, getByText } = renderWithTheme(
      <CloseAccountSetting />
    );
    const button = getByTestId('close-account-button');
    fireEvent.mouseOver(button);

    await waitFor(() => {
      expect(getByRole('tooltip')).toBeInTheDocument();
    });

    expect(getByText(CHILD_USER_CLOSE_ACCOUNT_TOOLTIP_TEXT)).toBeVisible();
    expect(button).toHaveAttribute('aria-describedby', 'button-tooltip');
    expect(button).not.toHaveAttribute('disabled');
    expect(button).toHaveAttribute('aria-disabled', 'true');
  });

  it('should render a disabled Close Account button with tooltip for a proxy account user', async () => {
    queryMocks.useProfile.mockReturnValue({
      data: profileFactory.build({ user_type: 'proxy' }),
    });

    const { getByRole, getByTestId, getByText } = renderWithTheme(
      <CloseAccountSetting />
    );
    const button = getByTestId('close-account-button');
    fireEvent.mouseOver(button);

    await waitFor(() => {
      expect(getByRole('tooltip')).toBeInTheDocument();
    });

    expect(getByText(PROXY_USER_CLOSE_ACCOUNT_TOOLTIP_TEXT)).toBeVisible();
    expect(button).toHaveAttribute('aria-describedby', 'button-tooltip');
    expect(button).not.toHaveAttribute('disabled');
    expect(button).toHaveAttribute('aria-disabled', 'true');
  });

  it('should disable Close Account button if the user does not have close_account permissions', async () => {
    queryMocks.userPermissions.mockReturnValue({
      data: { cancel_account: false },
    });
    queryMocks.useProfile.mockReturnValue({
      data: profileFactory.build({ user_type: 'default' }),
    });

    const { getByTestId } = renderWithTheme(<CloseAccountSetting />);
    const button = getByTestId('close-account-button');
    expect(button).toBeInTheDocument();
    expect(button).toBeDisabled();
  });
});
