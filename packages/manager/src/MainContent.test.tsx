import { render, waitFor } from '@testing-library/react';
import * as React from 'react';

import { rest, server } from 'src/mocks/testServer';
import { wrapWithTheme } from 'src/utilities/testHelpers';

import MainContent, {
  checkFlagsForMainContentBanner,
  checkPreferencesForBannerDismissal,
} from './MainContent';
import { queryClientFactory } from './queries/base';

const queryClient = queryClientFactory();

const mainContentBanner = {
  key: 'Test Text Key',
  link: {
    text: 'Test anchor text',
    url: 'https://linode.com',
  },
  text: 'Test Text',
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

describe('databases menu for a restricted user', () => {
  it('should not render the menu item', async () => {
    server.use(
      rest.get('*/account', (req, res, ctx) => {
        return res(ctx.json({}));
      })
    );
    const { getByText } = render(
      wrapWithTheme(
        <MainContent appIsLoading={false} isLoggedInAsCustomer={true} />,
        {
          flags: { databases: false },
          queryClient,
        }
      )
    );

    await waitFor(() => {
      let el;
      try {
        el = getByText('Databases');
      } catch (e) {
        expect(el).not.toBeDefined();
      }
    });
  });
});
