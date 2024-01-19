import { fireEvent, waitFor } from '@testing-library/react';
import * as React from 'react';

import { accountFactory, profileFactory } from 'src/factories';
import { makeResourcePage } from 'src/mocks/serverHandlers';
import { renderWithTheme } from 'src/utilities/testHelpers';

import CloseAccountSetting from './CloseAccountSetting';
import {
  CHILD_PROXY_USER_CLOSE_ACCOUNT_TOOLTIP_TEXT,
  PARENT_USER_CLOSE_ACCOUNT_TOOLTIP_TEXT,
} from './constants';

// Mock the useChildAccounts and useProfile hooks to immediately return the expected data, circumventing the HTTP request and loading state.
const queryMocks = vi.hoisted(() => ({
  useChildAccounts: vi.fn().mockReturnValue({}),
  useProfile: vi.fn().mockReturnValue({}),
}));

vi.mock('src/queries/profile', async () => {
  const actual = await vi.importActual<any>('src/queries/profile');
  return {
    ...actual,
    useProfile: queryMocks.useProfile,
  };
});

vi.mock('src/queries/account', async () => {
  const actual = await vi.importActual<any>('src/queries/account');
  return {
    ...actual,
    useChildAccounts: queryMocks.useChildAccounts,
  };
});

describe('Close Account Settings', () => {
  it('should render subheading text', () => {
    const { container } = renderWithTheme(<CloseAccountSetting />);
    const subheading = container.querySelector(
      '[data-qa-panel-subheading="true"]'
    );
    expect(subheading).toBeInTheDocument();
    expect(subheading?.textContent).toBe('Close Account');
  });

  it('should render a Close Account Button', () => {
    const { getByTestId } = renderWithTheme(<CloseAccountSetting />);
    const button = getByTestId('close-account-button');
    const span = button.querySelector('span');
    expect(button).toBeInTheDocument();
    expect(span).toHaveTextContent('Close Account');
  });

  it('should render a disabled Close Account button with tooltip when there is at least one child account', async () => {
    queryMocks.useProfile.mockReturnValue({
      data: profileFactory.build({ user_type: 'parent' }),
    });
    queryMocks.useChildAccounts.mockReturnValue({
      data: makeResourcePage(accountFactory.buildList(1)),
    });

    const { getByRole, getByTestId, getByText } = renderWithTheme(
      <CloseAccountSetting />,
      {
        flags: { parentChildAccountAccess: true },
      }
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
      <CloseAccountSetting />,
      {
        flags: { parentChildAccountAccess: true },
      }
    );
    const button = getByTestId('close-account-button');
    fireEvent.mouseOver(button);

    await waitFor(() => {
      expect(getByRole('tooltip')).toBeInTheDocument();
    });

    expect(
      getByText(CHILD_PROXY_USER_CLOSE_ACCOUNT_TOOLTIP_TEXT)
    ).toBeVisible();
    expect(button).toHaveAttribute('aria-describedby', 'button-tooltip');
    expect(button).not.toHaveAttribute('disabled');
    expect(button).toHaveAttribute('aria-disabled', 'true');
  });

  it('should render a disabled Close Account button with tooltip for a proxy account user', async () => {
    queryMocks.useProfile.mockReturnValue({
      data: profileFactory.build({ user_type: 'proxy' }),
    });

    const { getByRole, getByTestId, getByText } = renderWithTheme(
      <CloseAccountSetting />,
      {
        flags: { parentChildAccountAccess: true },
      }
    );
    const button = getByTestId('close-account-button');
    fireEvent.mouseOver(button);

    await waitFor(() => {
      expect(getByRole('tooltip')).toBeInTheDocument();
    });

    expect(
      getByText(CHILD_PROXY_USER_CLOSE_ACCOUNT_TOOLTIP_TEXT)
    ).toBeVisible();
    expect(button).toHaveAttribute('aria-describedby', 'button-tooltip');
    expect(button).not.toHaveAttribute('disabled');
    expect(button).toHaveAttribute('aria-disabled', 'true');
  });
});
