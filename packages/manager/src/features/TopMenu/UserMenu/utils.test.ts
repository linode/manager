import { UserType } from '@linode/api-v4';

import { profileFactory } from 'src/factories';

import { getCompanyNameOrEmail } from './utils';

const MOCK_COMPANY_NAME = 'Test Company, LLC';

describe('getCompanyNameOrEmail', () => {
  it('returns the company name for a parent/child/proxy user who has one', async () => {
    const newUserTypes = ['parent', 'child', 'proxy'];

    newUserTypes.forEach((newUserType: UserType) => {
      const actual = getCompanyNameOrEmail({
        company: MOCK_COMPANY_NAME,
        isParentChildFeatureEnabled: true,
        profile: profileFactory.build({ user_type: newUserType }),
      });
      const expected = MOCK_COMPANY_NAME;
      expect(actual).toEqual(expected);
    });
  });

  it('returns email of a parent user who does not have (access to) a company name', async () => {
    const parentEmail = 'parent@email.com';

    const actual = getCompanyNameOrEmail({
      company: undefined,
      isParentChildFeatureEnabled: true,
      profile: profileFactory.build({
        email: parentEmail,
        user_type: 'parent',
      }),
    });
    const expected = parentEmail;
    expect(actual).toEqual(expected);
  });

  it("returns undefined for a child user who does not have (access to) a company name, since we don't need to display it", async () => {
    const childEmail = 'child@email.com';

    const actual = getCompanyNameOrEmail({
      company: undefined,
      isParentChildFeatureEnabled: true,
      profile: profileFactory.build({
        email: childEmail,
        user_type: 'child',
      }),
    });
    const expected = undefined;
    expect(actual).toEqual(expected);
  });

  it('returns undefined for the company/email of a regular (default) user', async () => {
    const actual = getCompanyNameOrEmail({
      company: MOCK_COMPANY_NAME,
      isParentChildFeatureEnabled: true,
      profile: profileFactory.build({ user_type: 'default' }),
    });
    const expected = undefined;
    expect(actual).toEqual(expected);
  });

  it('returns undefined for the company/email of all users when the parent/child feature is not enabled', async () => {
    const allUserTypes = ['parent', 'child', 'proxy', 'default'];

    allUserTypes.forEach((userType: UserType) => {
      const actual = getCompanyNameOrEmail({
        company: MOCK_COMPANY_NAME,
        isParentChildFeatureEnabled: false,
        profile: profileFactory.build({ user_type: userType }),
      });
      const expected = undefined;
      expect(actual).toEqual(expected);
    });
  });
});
