import * as React from 'react';

import { profileFactory } from 'src/factories';
import { grantsFactory } from 'src/factories/grants';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { ContactInformation } from './ContactInformation';

const EDIT_BUTTON_ID = 'edit-contact-info';

const queryMocks = vi.hoisted(() => ({
  useGrants: vi.fn().mockReturnValue({}),
  useProfile: vi.fn().mockReturnValue({}),
}));

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
  profile: queryMocks.useProfile().data,
  state: 'PA',
  taxId: '1337',
  zip: '19106',
};

vi.mock('src/queries/profile/profile', async () => {
  const actual = await vi.importActual<any>('src/queries/profile/profile');
  return {
    ...actual,
    useGrants: queryMocks.useGrants,
    useProfile: queryMocks.useProfile,
  };
});

describe('Edit Contact Information', () => {
  it('should be disabled for all child users', () => {
    queryMocks.useProfile.mockReturnValue({
      data: profileFactory.build({
        user_type: 'child',
      }),
    });

    const { getByTestId } = renderWithTheme(
      <ContactInformation {...props} profile={queryMocks.useProfile().data} />
    );

    expect(getByTestId(EDIT_BUTTON_ID)).toHaveAttribute(
      'aria-disabled',
      'true'
    );
  });

  it('should be disabled for restricted users', () => {
    queryMocks.useProfile.mockReturnValue({
      data: profileFactory.build({
        restricted: true,
        user_type: 'default',
      }),
    });

    queryMocks.useGrants.mockReturnValue({
      data: grantsFactory.build({
        global: {
          account_access: 'read_only',
        },
      }),
    });

    const { getByTestId } = renderWithTheme(<ContactInformation {...props} />);

    expect(getByTestId(EDIT_BUTTON_ID)).toHaveAttribute(
      'aria-disabled',
      'true'
    );
  });
});
