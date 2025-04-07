import { profileFactory } from '@linode/utilities';

import { getCompanyNameOrEmail } from './utils';

import type { UserType } from '@linode/api-v4';

const MOCK_COMPANY_NAME = 'Test Company, LLC';

describe('getCompanyNameOrEmail', () => {
  it('returns the company name for a parent/child/proxy user who has one', async () => {
    const newUserTypes = ['parent', 'child', 'proxy'];

    newUserTypes.forEach((newUserType: UserType) => {
      const actual = getCompanyNameOrEmail({
        company: MOCK_COMPANY_NAME,
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
      profile: profileFactory.build({ user_type: 'default' }),
    });
    const expected = undefined;
    expect(actual).toEqual(expected);
  });
});
