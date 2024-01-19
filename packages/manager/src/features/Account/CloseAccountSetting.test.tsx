import * as React from 'react';

import { accountFactory } from 'src/factories';
import { accountUserFactory } from 'src/factories/accountUsers';
import { makeResourcePage } from 'src/mocks/serverHandlers';
import { renderWithTheme } from 'src/utilities/testHelpers';

import CloseAccountSetting from './CloseAccountSetting';

// Mock the useChildAccounts and useAccountUser hooks to immediately return the expected data, circumventing the HTTP request and loading state.
const queryMocks = vi.hoisted(() => ({
  useAccountUser: vi.fn().mockReturnValue({}),
  useChildAccounts: vi.fn().mockReturnValue({}),
}));

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

  it('should render a disabled Close Account button and helper text when there is at least one child account', () => {
    queryMocks.useChildAccounts.mockReturnValue({
      data: makeResourcePage(accountFactory.buildList(1)),
    });

    const { getByTestId, getByText } = renderWithTheme(
      <CloseAccountSetting />,
      {
        flags: { parentChildAccountAccess: true },
      }
    );
    const notice = getByText(
      'Remove indirect customers before closing the account.'
    );
    const button = getByTestId('close-account-button');
    expect(notice).toBeInTheDocument();
    expect(button).not.toHaveAttribute('disabled');
    expect(button).toHaveAttribute('aria-disabled', 'true');
  });

  it('should render a disabled Close Account button for a child account user', () => {
    queryMocks.useAccountUser.mockReturnValue({
      data: accountUserFactory.build({ user_type: 'child' }),
    });

    const { getByTestId } = renderWithTheme(<CloseAccountSetting />, {
      flags: { parentChildAccountAccess: true },
    });
    const button = getByTestId('close-account-button');
    expect(button).not.toHaveAttribute('disabled');
    expect(button).toHaveAttribute('aria-disabled', 'true');
  });

  it('should render a disabled Close Account button for a proxy account user', () => {
    queryMocks.useAccountUser.mockReturnValue({
      data: accountUserFactory.build({ user_type: 'proxy' }),
    });

    const { getByTestId } = renderWithTheme(<CloseAccountSetting />, {
      flags: { parentChildAccountAccess: true },
    });
    const button = getByTestId('close-account-button');
    expect(button).not.toHaveAttribute('disabled');
    expect(button).toHaveAttribute('aria-disabled', 'true');
  });
});
