import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { IncidentBanner, StatusBanners } from './StatusBanners';

import type { IncidentProps } from './StatusBanners';

const props: IncidentProps = {
  href: 'https://www.example.com/',
  impact: 'major',
  message: 'We are monitoring this incident.',
  status: 'monitoring',
  title: 'my incident',
};

describe('Status banners from statuspage.io', () => {
  describe('StatusBanners wrapper component', () => {
    it('should display a banner for every active incident', async () => {
      renderWithTheme(<StatusBanners />);
      expect(await screen.findAllByTestId('status-banner')).toHaveLength(2);
    });
  });

  describe('IncidentBanner component', () => {
    it('should display the status of each incident', async () => {
      renderWithTheme(<IncidentBanner {...props} />);
      expect(screen.getByText(/monitoring/)).toBeInTheDocument();
    });

    it('clicking the link should redirect you to the provided href', async () => {
      renderWithTheme(<IncidentBanner {...props} />);
      expect(screen.getByRole('link')).toHaveAttribute('href', props.href);
    });

    it("clicking a banner's close icon should remove it from view", async () => {
      const { container } = renderWithTheme(<IncidentBanner {...props} />);
      const dismissButton = screen.getByTestId('notice-dismiss');
      await userEvent.click(dismissButton);
      expect(container).toBeEmptyDOMElement();
    });
  });
});
