import * as React from 'react';
import userEvent from '@testing-library/user-event'
import { screen, waitFor } from '@testing-library/react';

import { SubnetNode } from "./SubnetNode";
import {
  renderWithTheme,
} from 'src/utilities/testHelpers';

describe('SubnetNode', () => {
  it('should calculate the correct subnet mask', async () => {
    renderWithTheme(
      <SubnetNode 
        disabled={false} 
        idx={0}
        key={'0'}
        onChange={() => {}}
        subnet={{ label: '', ip: { address: ''}}}
      />
    );
    const subnetAddress = screen.getAllByTestId('textfield-input');
    expect(subnetAddress[1]).toBeInTheDocument();
    // this is hacky and should revist this 
    userEvent.type(subnetAddress[1], '192.0.0.0/24', { delay: 1});

    await waitFor(() => expect(subnetAddress[1]).toHaveValue('192.0.0.0/24'));
    const availIps = screen.getByText('Available IP Addresses: 252');
    expect(availIps).toBeInTheDocument();
  });
});