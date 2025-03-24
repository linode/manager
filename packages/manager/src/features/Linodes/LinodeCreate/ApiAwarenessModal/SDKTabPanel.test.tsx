import { fireEvent, screen } from '@testing-library/react';
import React from 'react';

import { Tabs } from 'src/components/Tabs/Tabs';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { gettingStartedGuides as goResources } from './GoSDKResources';
import { gettingStartedGuides as pythonResources } from './PythonSDKResources';
import { SDKTabPanel } from './SDKTabPanel';

import type { SDKTabPanelProps } from './SDKTabPanel';

const defaultProps: SDKTabPanelProps = {
  payLoad: {
    image: 'linode/ubuntu24.04',
    label: 'debian-us-ord-001',
    region: 'us-ord',
    root_pass: 'testpassword',
    type: 'g6-dedicated-2',
  },
  title: `SDK's`,
};

vi.mock('@reach/tabs', async () => {
  const actual = await vi.importActual<any>('@reach/tabs');
  return {
    ...actual,
    useTabsContext: vi.fn(() => ({ selectedIndex: 3 })),
  };
});

describe('SDKTabPanel', () => {
  it('Should render SDKTabPanel', () => {
    renderWithTheme(
      <Tabs>
        <SDKTabPanel {...defaultProps} />
      </Tabs>
    );
    expect(screen.getByPlaceholderText('Select An SDK')).toBeInTheDocument();
  });
  it('Should update the state correctly and render relevant resources when Go is selected', async () => {
    renderWithTheme(
      <Tabs>
        <SDKTabPanel {...defaultProps} />
      </Tabs>
    );

    // Check initial value of the SDK field
    expect(screen.getByPlaceholderText('Select An SDK')).toHaveValue('');

    // Open the dropdown
    const element = screen.getByRole('button', {
      hidden: true,
      name: 'Open',
    });
    fireEvent.click(element);

    // Select the option Go
    fireEvent.click(
      screen.getByRole('option', { hidden: true, name: 'Go (linodego)' })
    );

    // Check updated value of the SDK field
    expect(screen.getByPlaceholderText('Select An SDK')).toHaveValue(
      'Go (linodego)'
    );

    // Validate all Go resources
    goResources.forEach(({ text, to }) => {
      const linkElement = screen.getByRole('link', {
        hidden: true,
        name: `${text} - link opens in a new tab`,
      });
      expect(linkElement).toBeInTheDocument();
      expect(linkElement).toHaveAttribute('href', to);
    });
  });
  it('Should update the state correctly and render relevant resources when Python is selected', async () => {
    renderWithTheme(
      <Tabs>
        <SDKTabPanel {...defaultProps} />
      </Tabs>
    );

    // Check initial value of the SDK field
    expect(screen.getByPlaceholderText('Select An SDK')).toHaveValue('');

    // Open the dropdown
    const element = screen.getByRole('button', {
      hidden: true,
      name: 'Open',
    });
    fireEvent.click(element);

    // Select the option Python
    fireEvent.click(
      screen.getByRole('option', {
        hidden: true,
        name: 'Python (linode_api4-python)',
      })
    );

    // Check updated value of the SDK field
    expect(screen.getByPlaceholderText('Select An SDK')).toHaveValue(
      'Python (linode_api4-python)'
    );

    // Validate all Python resources
    pythonResources.forEach(({ text, to }) => {
      const linkElement = screen.getByRole('link', {
        hidden: true,
        name: `${text} - link opens in a new tab`,
      });
      expect(linkElement).toBeInTheDocument();
      expect(linkElement).toHaveAttribute('href', to);
    });
  });
});
