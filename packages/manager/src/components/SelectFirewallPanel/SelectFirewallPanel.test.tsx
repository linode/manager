import { fireEvent, waitFor } from '@testing-library/react';
import * as React from 'react';
import { QueryClient } from 'react-query';

import { mockMatchMedia, renderWithTheme } from 'src/utilities/testHelpers';

import { SelectFirewallPanel } from './SelectFirewallPanel';
import { createFirewallLabel } from './SelectFirewallPanel';

const queryClient = new QueryClient();

beforeAll(() => mockMatchMedia());
afterEach(() => {
  queryClient.clear();
});

const testId = 'select-firewall-panel';

describe('SelectFirewallPanel', () => {
  it('should render', async () => {
    const wrapper = renderWithTheme(
      <SelectFirewallPanel
        handleFirewallChange={jest.fn()}
        helperText={<span>Testing</span>}
      />,
      {
        queryClient,
      }
    );

    await waitFor(() => {
      expect(wrapper.getByTestId(testId)).toBeInTheDocument();
    });
  });

  it('should open a Create Firewall drawer when the link is clicked', async () => {
    const wrapper = renderWithTheme(
      <SelectFirewallPanel
        handleFirewallChange={jest.fn()}
        helperText={<span>Testing</span>}
      />,
      {
        queryClient,
      }
    );

    const createFirewallLink = wrapper.getByText('Create Firewall');

    fireEvent.click(createFirewallLink);

    await waitFor(() => {
      expect(wrapper.getByLabelText(createFirewallLabel)).toBeInTheDocument();
    });
  });
});
