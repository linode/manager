import { waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import React from 'react';

import { HttpResponse, http, server } from 'src/mocks/testServer';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { MainContentBanner } from './MainContentBanner';

import type { ManagerPreferences } from '@linode/utilities';

describe('MainContentBanner', () => {
  const mainContentBanner = {
    key: 'test-banner-1',
    link: {
      text: 'Learn more.',
      url: 'https://akamai.com',
    },
    text: 'Linode is now Akamai 🤯',
  };

  it('should render a banner from feature flags', () => {
    const { getByText } = renderWithTheme(<MainContentBanner />, {
      flags: { mainContentBanner },
    });

    expect(getByText('Linode is now Akamai 🤯')).toBeVisible();
  });

  it('should render a link from feature flags', () => {
    const { getByText } = renderWithTheme(<MainContentBanner />, {
      flags: { mainContentBanner },
    });

    const link = getByText('Learn more.');

    expect(link).toBeVisible();
    expect(link).toBeEnabled();
    expect(link).toHaveRole('link');
    expect(link).toHaveAttribute('href', 'https://akamai.com/');
  });

  it('should be dismissable', async () => {
    const { container, getByLabelText } = renderWithTheme(
      <MainContentBanner />,
      {
        flags: { mainContentBanner },
      }
    );

    const closeButton = getByLabelText('Close');

    expect(closeButton).toBeVisible();
    expect(closeButton).toBeEnabled();

    await userEvent.click(closeButton);

    expect(container).toBeEmptyDOMElement();
  });

  it('should not render if the user dismissed the banner', async () => {
    const preferences: ManagerPreferences = {
      main_content_banner_dismissal: {
        'test-banner-1': true,
      },
    };

    server.use(
      http.get('*/v4/profile/preferences', () => {
        return HttpResponse.json(preferences);
      })
    );

    const { container } = renderWithTheme(<MainContentBanner />, {
      flags: { mainContentBanner },
    });

    await waitFor(() => {
      expect(container).toBeEmptyDOMElement();
    });
  });
});
