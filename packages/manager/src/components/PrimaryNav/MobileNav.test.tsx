import * as React from 'react';
import { renderWithTheme } from 'src/utilities/testHelpers';
import MobileNav from './MobileNav';

describe('MobileNav', () => {
  it('should not display hidden links', () => {
    const { queryByTestId } = renderWithTheme(
      <MobileNav
        groups={[
          {
            group: 'Monitors',
            links: [
              {
                display: 'Longview',
                href: '/longview'
              },
              {
                display: 'Managed',
                href: '/managed',
                hide: true
              }
            ]
          }
        ]}
      />
    );
    expect(queryByTestId('menu-item-Longview')).toBeInTheDocument();
    expect(queryByTestId('menu-item-Managed')).not.toBeInTheDocument();
  });
});
