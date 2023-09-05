import * as React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import BetasLanding from './BetasLanding';

describe('BetasLanding', () => {
  it('should be defined', () => {
    expect(BetasLanding).toBeDefined();
  });

  it('should have the page title of Betas', () => {
    const { getByText } = renderWithTheme(<BetasLanding />);
    const pageTitle = getByText('Betas', { selector: 'h1' });
    expect(pageTitle).not.toBeNull();
  });

  it('should have a paper for enrolled, active, and expired betas', () => {
    const { getByText } = renderWithTheme(<BetasLanding />);
    const enrolledPageHeader = getByText('Currently Enrolled Betas', {
      selector: 'h2',
    });
    const activePageHeader = getByText('Available & Upcoming Betas', {
      selector: 'h2',
    });
    const expiredPageHeader = getByText('Beta Participation History', {
      selector: 'h2',
    });
    expect(enrolledPageHeader).not.toBeNull();
    expect(activePageHeader).not.toBeNull();
    expect(expiredPageHeader).not.toBeNull();
  });
});
