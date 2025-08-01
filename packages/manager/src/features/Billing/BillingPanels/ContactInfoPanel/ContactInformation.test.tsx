import { profileFactory } from '@linode/utilities';
import * as React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { ContactInformation } from './ContactInformation';

const EDIT_BUTTON_ID = 'edit-contact-info';

const queryMocks = vi.hoisted(() => ({
  useProfile: vi.fn().mockReturnValue({}),
  userPermissions: vi.fn(() => ({
    data: { update_account: false },
  })),
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

vi.mock('src/features/IAM/hooks/usePermissions', () => ({
  usePermissions: queryMocks.userPermissions,
}));

vi.mock('@linode/queries', async () => {
  const actual = await vi.importActual<any>('@linode/queries');
  return {
    ...actual,
    useProfile: queryMocks.useProfile,
  };
});

describe('Edit Contact Information', () => {
  it('should be disabled for all child users', async () => {
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

  it('should be disabled if user does not have update_account permission', async () => {
    queryMocks.useProfile.mockReturnValue({
      data: profileFactory.build({
        restricted: true,
        user_type: 'default',
      }),
    });

    const { getByTestId } = renderWithTheme(<ContactInformation {...props} />);

    expect(getByTestId(EDIT_BUTTON_ID)).toHaveAttribute(
      'aria-disabled',
      'true'
    );
  });

  it('should be enabled if user has update_account permission', async () => {
    queryMocks.useProfile.mockReturnValue({
      data: profileFactory.build({
        restricted: true,
        user_type: 'default',
      }),
    });

    queryMocks.userPermissions.mockReturnValue({
      data: { update_account: true },
    });

    const { getByTestId } = renderWithTheme(<ContactInformation {...props} />);

    expect(getByTestId(EDIT_BUTTON_ID)).not.toHaveAttribute(
      'aria-disabled',
      'true'
    );
  });

  it('should be disabled for all child users and if user has update_account permission', async () => {
    queryMocks.useProfile.mockReturnValue({
      data: profileFactory.build({
        user_type: 'child',
      }),
    });

    queryMocks.userPermissions.mockReturnValue({
      data: { update_account: true },
    });

    const { getByTestId } = renderWithTheme(
      <ContactInformation {...props} profile={queryMocks.useProfile().data} />
    );

    expect(getByTestId(EDIT_BUTTON_ID)).toHaveAttribute(
      'aria-disabled',
      'true'
    );
  });
});
