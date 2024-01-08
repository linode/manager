import * as React from 'react';

import { profileFactory } from 'src/factories';
import { accountFactory } from 'src/factories/account';
import { accountUserFactory } from 'src/factories/accountUsers';
import { grantsFactory } from 'src/factories/grants';
import { renderWithTheme } from 'src/utilities/testHelpers';

import ContactInformation from './ContactInformation';

const ADD_PAYMENT_METHOD_BUTTON_ID = 'payment-info-add-payment-method';

const queryMocks = vi.hoisted(() => ({
  useAccount: vi.fn().mockReturnValue({}),
  useAccountUser: vi.fn().mockReturnValue({}),
  useGrants: vi.fn().mockReturnValue({}),
  useProfile: vi.fn().mockReturnValue({}),
}));

vi.mock('src/queries/account', async () => {
  const actual = await vi.importActual<any>('src/queries/account');
  return {
    ...actual,
    useAccount: queryMocks.useAccount,
  };
});

vi.mock('src/queries/accountUsers', async () => {
  const actual = await vi.importActual<any>('src/queries/accountUsers');
  return {
    ...actual,
    useAccountUser: queryMocks.useAccountUser,
  };
});

vi.mock('src/queries/profile', async () => {
  const actual = await vi.importActual<any>('src/queries/profile');
  return {
    ...actual,
    useGrants: queryMocks.useGrants,
    useProfile: queryMocks.useAccountUser,
  };
});

describe('Edit Contact Information', () => {
  it('should be disabled for all child users', () => {
    queryMocks.useProfile.mockReturnValue({
      data: profileFactory.build({
        restricted: false,
      }),
    });

    queryMocks.useAccountUser.mockReturnValue({
      data: accountUserFactory.build({ user_type: 'child' }),
    });

    queryMocks.useAccount.mockReturnValue({
      data: accountFactory.build(),
    });

    const { getByTestId } = renderWithTheme(
      <ContactInformation
        address1={queryMocks.useAccount().data?.address_1}
        address2={queryMocks.useAccount().data?.address_2}
        city={queryMocks.useAccount().data?.city}
        company={queryMocks.useAccount().data?.company}
        country={queryMocks.useAccount().data?.country}
        email={queryMocks.useAccount().data?.email}
        firstName={queryMocks.useAccount().data?.first_name}
        lastName={queryMocks.useAccount().data?.last_name}
        phone={queryMocks.useAccount().data?.phone}
        state={queryMocks.useAccount().data?.state}
        taxId={queryMocks.useAccount().data?.tax_id}
        zip={queryMocks.useAccount().data?.zip}
      />,
      {
        flags: { parentChildAccountAccess: true },
      }
    );

    expect(getByTestId(ADD_PAYMENT_METHOD_BUTTON_ID)).toHaveAttribute(
      'aria-disabled',
      'true'
    );
  });

  it('should be disabled for non-parent/child restricted users', () => {
    queryMocks.useGrants.mockReturnValue({
      data: grantsFactory.build({
        global: {
          account_access: 'read_only',
        },
      }),
    });

    queryMocks.useAccount.mockReturnValue({
      data: accountFactory.build(),
    });

    const { getByTestId } = renderWithTheme(
      <ContactInformation
        address1={queryMocks.useAccount().data?.address_1}
        address2={queryMocks.useAccount().data?.address_2}
        city={queryMocks.useAccount().data?.city}
        company={queryMocks.useAccount().data?.company}
        country={queryMocks.useAccount().data?.country}
        email={queryMocks.useAccount().data?.email}
        firstName={queryMocks.useAccount().data?.first_name}
        lastName={queryMocks.useAccount().data?.last_name}
        phone={queryMocks.useAccount().data?.phone}
        state={queryMocks.useAccount().data?.state}
        taxId={queryMocks.useAccount().data?.tax_id}
        zip={queryMocks.useAccount().data?.zip}
      />
    );

    const addPaymentMethodButton = getByTestId(ADD_PAYMENT_METHOD_BUTTON_ID);

    expect(addPaymentMethodButton).toHaveAttribute('aria-disabled', 'true');
  });
});
