import { cleanup, fireEvent } from '@testing-library/react';
import { renderWithTheme } from 'src/utilities/testHelpers';

import * as React from 'react';

import OverflowIPs from './OverflowIPs';
afterEach(cleanup);

describe('OverflowIPs', () => {
  it('should render without error and display the number of IPs', () => {
    const { getByText } = renderWithTheme(<OverflowIPs ips={['8.8.8.8']} />);
    expect(getByText('+1')).toBeTruthy();
  });

  it('should render each IPAddress when the chip is clicked', () => {
    const { getByText, getAllByRole } = renderWithTheme(
      <OverflowIPs ips={['8.8.8.8', '8.8.4.4', '192.168.100.112']} />
    );
    const el = getByText('+3');
    expect(el).toBeTruthy();
    fireEvent.click(el);
    expect(getAllByRole('listitem')).toHaveLength(3);
  });
});
