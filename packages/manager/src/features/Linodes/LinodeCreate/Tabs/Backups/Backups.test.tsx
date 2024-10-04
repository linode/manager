import React from 'react';

import { renderWithThemeAndHookFormContext } from 'src/utilities/testHelpers';

import { Backups } from './Backups';

describe('Backups', () => {
  it('renders a Linode Select section', () => {
    const { getByText } = renderWithThemeAndHookFormContext({
      component: <Backups />,
    });

    const heading = getByText('Select Linode');

    expect(heading).toBeVisible();
    expect(heading.tagName).toBe('H2');
  });

  it('renders a Backup Select section', () => {
    const { getByText } = renderWithThemeAndHookFormContext({
      component: <Backups />,
    });

    const heading = getByText('Select Backup');

    expect(heading).toBeVisible();
    expect(heading.tagName).toBe('H2');
  });
});
