import * as React from 'react';

import { accountUserFactory } from 'src/factories/accountUsers';
import { renderWithTheme } from 'src/utilities/testHelpers';

import ContactInformation from './ContactInformation';

const EDIT_BUTTON_ID = 'edit-contact-info';

const props = {
  address1: '123 Linode Lane',
  address2: '',
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
  useAccountUser: vi.fn().mockReturnValue({}),
  useGrants: vi.fn().mockReturnValue({}),
}));

vi.mock('src/queries/accountUsers', async () => {
  const actual = await vi.importActual<any>('src/queries/accountUsers');
  return {
    ...actual,
    useAccountUser: queryMocks.useAccountUser,
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

queryMocks.useAccountUser.mockReturnValue({
  data: accountUserFactory.build({ user_type: 'parent' }),
});

describe('Edit Contact Information', () => {
  it('should be disabled for all child users', () => {
    queryMocks.useAccountUser.mockReturnValue({
      data: accountUserFactory.build({ user_type: 'child' }),
    });

    const { getByTestId } = renderWithTheme(<ContactInformation {...props} />, {
      flags: { parentChildAccountAccess: true },
    });

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
