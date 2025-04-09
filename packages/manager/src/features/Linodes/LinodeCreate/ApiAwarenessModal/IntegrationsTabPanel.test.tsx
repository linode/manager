import { fireEvent, screen } from '@testing-library/react';
import React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { gettingStartedGuides as ansibleResources } from './AnsibleIntegrationResources';
import { IntegrationsTabPanel } from './IntegrationsTabPanel';
import { gettingStartedGuides as terraformResources } from './TerraformIntegrationResources';

import type { IntegrationsTabPanelProps } from './IntegrationsTabPanel';

const defaultProps: IntegrationsTabPanelProps = {
  payLoad: {
    image: 'linode/ubuntu24.04',
    label: 'debian-us-ord-001',
    region: 'us-ord',
    root_pass: 'testpassword',
    type: 'g6-dedicated-2',
  },
  title: 'Integrations',
};

vi.mock('@reach/tabs', async () => {
  const actual = await vi.importActual<any>('@reach/tabs');
  return {
    ...actual,
    useTabsContext: vi.fn(() => ({ selectedIndex: 2 })),
  };
});

describe('IntegrationsTabPanel', () => {
  it('Should render IntegrationsTabPanel', () => {
    renderWithTheme(<IntegrationsTabPanel {...defaultProps} />);
    expect(
      screen.getByPlaceholderText('Select Integration')
    ).toBeInTheDocument();
  });
  it('Should update the state correctly and render relevant resources when Ansible is selected', async () => {
    renderWithTheme(<IntegrationsTabPanel {...defaultProps} />);

    // Check initial value of the Inegrations field
    expect(screen.getByPlaceholderText('Select Integration')).toHaveValue('');

    // Open the dropdown
    const element = screen.getByRole('button', {
      hidden: true,
      name: 'Open',
    });
    fireEvent.click(element);

    // Select the option Ansible
    fireEvent.click(
      screen.getByRole('option', { hidden: true, name: 'Ansible' })
    );

    // Check updated value of the Inegrations field
    expect(screen.getByPlaceholderText('Select Integration')).toHaveValue(
      'Ansible'
    );

    // Validate all ansible resources
    ansibleResources.forEach(({ text, to }) => {
      const linkElement = screen.getByRole('link', {
        hidden: true,
        name: `${text} - link opens in a new tab`,
      });
      expect(linkElement).toBeInTheDocument();
      expect(linkElement).toHaveAttribute('href', to);
    });
  });
  it('Should update the state correctly and render relevant resources when Terraform is selected', async () => {
    renderWithTheme(<IntegrationsTabPanel {...defaultProps} />);

    // Check initial value of the Inegrations field
    expect(screen.getByPlaceholderText('Select Integration')).toHaveValue('');

    // Open the dropdown
    const element = screen.getByRole('button', {
      hidden: true,
      name: 'Open',
    });
    fireEvent.click(element);

    // Select the option Terraform
    fireEvent.click(
      screen.getByRole('option', { hidden: true, name: 'Terraform' })
    );

    // Check updated value of the Inegrations field
    expect(screen.getByPlaceholderText('Select Integration')).toHaveValue(
      'Terraform'
    );

    // Validate all Terraform resources
    terraformResources.forEach(({ text, to }) => {
      const linkElement = screen.getByRole('link', {
        hidden: true,
        name: `${text} - link opens in a new tab`,
      });
      expect(linkElement).toBeInTheDocument();
      expect(linkElement).toHaveAttribute('href', to);
    });
  });
});
