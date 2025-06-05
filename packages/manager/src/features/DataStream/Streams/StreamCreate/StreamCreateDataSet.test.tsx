import { screen } from '@testing-library/react';
import React from 'react';

import { renderWithThemeAndHookFormContext } from 'src/utilities/testHelpers';

import { StreamCreateDataSet } from './StreamCreateDataSet';

describe('StreamCreateDataSet', () => {
  it('should render table with proper headers', async () => {
    renderWithThemeAndHookFormContext({
      component: <StreamCreateDataSet />,
    });

    expect(screen.getByRole('table')).toBeVisible();
    expect(screen.getByText('Event Type')).toBeVisible();
    expect(screen.getByText('Description')).toBeVisible();
  });
});
