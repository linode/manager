import * as React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { NotificationMenuV2 } from './NotificationMenuV2';

describe('NotificationMenuV2', () => {
  // Very basic unit - the functionality is tested in the integration test
  it('should render', () => {
    const { getByRole } = renderWithTheme(<NotificationMenuV2 />);

    expect(getByRole('button', { name: 'Notifications' })).toBeInTheDocument();
  });
});
