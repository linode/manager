import * as React from 'react';

import { accountFactory } from 'src/factories';
import { makeResourcePage } from 'src/mocks/serverHandlers';
import { renderWithTheme } from 'src/utilities/testHelpers';

import CloseAccountSetting from './CloseAccountSetting';

// Mock the useChildAccounts hook to immediately return the expected data, circumventing the HTTP request and loading state.
const queryMocks = vi.hoisted(() => ({
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

  it('should render a disabled Close Account button and helper text when there are child account', () => {
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
    expect(button).toBeDisabled();
  });
});
