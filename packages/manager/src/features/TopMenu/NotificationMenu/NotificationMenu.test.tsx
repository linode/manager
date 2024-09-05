import * as React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { NotificationMenu } from './NotificationMenu';

describe('NotificationMenuV2', () => {
  // Very basic unit - the functionality is tested in the integration test
  it('should render', () => {
    const { getByRole } = renderWithTheme(<NotificationMenu />);

    expect(getByRole('button', { name: 'Notifications' })).toBeInTheDocument();
  });
});
