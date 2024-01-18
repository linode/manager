import * as React from 'react';

import { accountFactory } from 'src/factories';
import { CAPABILITY_CHILD } from 'src/features/Account/constants';
import { renderWithTheme } from 'src/utilities/testHelpers';

import ContactInformation from './ContactInformation';

const EDIT_BUTTON_ID = 'edit-contact-info';

const props = {
  address1: '123 Linode Lane',
  address2: '',
  capabilities: [],
  city: 'Philadelphia',
  company: 'Linny Corp',
  country: 'United States',
  email: 'linny@example.com',
  firstName: 'Linny',
  lastName: 'The Platypus',
  phone: '19005553221',
  state: 'PA',
  taxId: '1337',
  zip: '19106',
};

const queryMocks = vi.hoisted(() => ({
  useAccount: vi.fn().mockReturnValue({}),
  useGrants: vi.fn().mockReturnValue({}),
}));

vi.mock('src/queries/account', async () => {
  const actual = await vi.importActual<any>('src/queries/account');
  return {
    ...actual,
    useAccount: queryMocks.useAccount,
  };
});

// TODO: When we figure out issue with Vitest circular dependencies
// vi.mock('src/queries/profile', async () => {
//   const actual = await vi.importActual<any>('src/queries/profile');
//   return {
//     ...actual,
//     useGrants: queryMocks.useGrants,
//   };
// });

describe('Edit Contact Information', () => {
  it('should be disabled for all child users', () => {
    queryMocks.useAccount.mockReturnValue({
      data: accountFactory.build({
        capabilities: [CAPABILITY_CHILD],
      }),
    });

    const { getByTestId } = renderWithTheme(
      <ContactInformation
        {...props}
        capabilities={queryMocks.useAccount().data.capabilities ?? []}
      />,
      {
        flags: { parentChildAccountAccess: true },
      }
    );

    expect(getByTestId(EDIT_BUTTON_ID)).toHaveAttribute(
      'aria-disabled',
      'true'
    );
  });

  // TODO: When we figure out issue with Vitest circular dependencies
  // it('should be disabled for non-parent/child restricted users', () => {
  //   queryMocks.useGrants.mockReturnValue({
  //     data: grantsFactory.build({
  //       global: {
  //         account_access: 'read_only',
  //       },
  //     }),
  //   });

  //   const { getByTestId } = renderWithTheme(<ContactInformation {...props} />);

  //   expect(getByTestId(EDIT_BUTTON_ID)).toHaveAttribute(
  //     'aria-disabled',
  //     'true'
  //   );
  // });
});
