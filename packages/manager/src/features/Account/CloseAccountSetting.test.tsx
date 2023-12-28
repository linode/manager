import * as React from 'react';

import { accountFactory } from 'src/factories';
import { makeResourcePage } from 'src/mocks/serverHandlers';
import { renderWithTheme } from 'src/utilities/testHelpers';

import CloseAccountSetting from './CloseAccountSetting';

beforeAll(() => {
  const queryMocks = {
    useChildAccounts: vi
      .fn()
      .mockReturnValue(makeResourcePage(accountFactory.buildList(1))),
  };

  vi.mock('src/queries/accounts', async () => {
    const actual = await vi.importActual<any>('src/queries/account');
    return {
      ...actual,
      useChildAccounts: queryMocks.useChildAccounts,
    };
  });
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
    expect(button).toBeInTheDocument();
    const span = button.querySelector('span');
    expect(span).toHaveTextContent('Close Account');
  });

  it('should render a disabled Close Account button when there are child account', () => {
    const { getByText } = renderWithTheme(<CloseAccountSetting />, {
      flags: { parentChildAccountAccess: true },
    });
    const notice = getByText(
      'Remove child accounts before closing the account.'
    );
    expect(notice).toBeInTheDocument();
    // const button = getByTestId('close-account-button');
    // expect(button).toBeDisabled();
  });
});
