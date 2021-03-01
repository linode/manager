import {
  checkFlagsForMainContentBanner,
  checkPreferencesForBannerDismissal,
} from './MainContent';

const mainContentBanner = {
  text: 'Test Text',
  link: {
    text: 'Test anchor text',
    url: 'https://linode.com',
  },
  key: 'Test Text Key',
};

describe('checkFlagsForMainContentBanner', () => {
  it('returns `true` if a valid banner is present in the flag set', () => {
    expect(checkFlagsForMainContentBanner({ mainContentBanner })).toBe(true);
    expect(checkFlagsForMainContentBanner({})).toBe(false);
    expect(
      checkFlagsForMainContentBanner({ mainContentBanner: {} as any })
    ).toBe(false);
  });
});

describe('checkPreferencesForBannerDismissal', () => {
  it('returns `true if the specified key is preset in preferences banner dismissals', () => {
    expect(
      checkPreferencesForBannerDismissal(
        {
          main_content_banner_dismissal: { key1: true },
        },
        'key1'
      )
    ).toBe(true);
    expect(
      checkPreferencesForBannerDismissal(
        {
          main_content_banner_dismissal: { key1: true },
        },
        'another-key'
      )
    ).toBe(false);
    expect(checkPreferencesForBannerDismissal({}, 'key1')).toBe(false);
  });
});
