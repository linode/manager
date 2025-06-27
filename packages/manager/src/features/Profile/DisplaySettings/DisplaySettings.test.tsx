import React from 'react';

import { DisplaySettings } from 'src/features/Profile/DisplaySettings/DisplaySettings';
import { renderWithThemeAndRouter } from 'src/utilities/testHelpers';

describe('DisplaySettings', () => {
  it('renders profile display sections', async () => {
    const { getByText } = await renderWithThemeAndRouter(<DisplaySettings />);

    expect(getByText('Avatar')).toBeVisible();
    expect(getByText('Username')).toBeVisible();
    expect(getByText('Email')).toBeVisible();
    expect(getByText('Timezone')).toBeVisible();
  });
});
