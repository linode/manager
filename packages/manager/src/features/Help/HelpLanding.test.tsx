import * as React from 'react';

import { renderWithThemeAndRouter } from 'src/utilities/testHelpers';

import { HelpLanding } from './HelpLanding';

describe('Help Landing', () => {
  it('should render search panel', async () => {
    const { getByText } = await renderWithThemeAndRouter(<HelpLanding />);

    expect(getByText('What can we help you with?')).toBeVisible();
  });

  it('should render popular posts panel', async () => {
    const { getByText } = await renderWithThemeAndRouter(<HelpLanding />);

    expect(getByText('Most Popular Documentation:')).toBeVisible();
    expect(getByText('Most Popular Community Posts:')).toBeVisible();
  });

  it('should render other ways panel', async () => {
    const { getByText } = await renderWithThemeAndRouter(<HelpLanding />);

    expect(getByText('Other Ways to Get Help')).toBeVisible();
  });
});
