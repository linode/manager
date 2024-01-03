import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import { renderWithThemeAndFormik } from 'src/utilities/testHelpers';

import {
  LoadBalancerCreateFormData,
  initialValues,
} from '../../../LoadBalancerCreateFormWrapper';
import { ConfigurationAccordion } from './ConfigurationAccordion';

const mockConfiguration: LoadBalancerCreateFormData['configurations'][number] = {
  certificates: [],
  label: 'test-config-label',
  port: 8080,
  protocol: 'http',
  routes: [{ label: 'route-label', protocol: 'http', rules: [] }],
  service_targets: [],
};
const index = 0;
const configHeading = 'Configuration — test-config-label | 1 Route Edit';

describe('ConfigurationAccordion', () => {
  test('renders with configuration details', () => {
    renderWithThemeAndFormik<LoadBalancerCreateFormData>(
      <ConfigurationAccordion
        configuration={mockConfiguration}
        index={index}
      />,
      {
        initialValues,
        onSubmit: vi.fn(),
      }
    );

    expect(
      screen.getByRole('heading', {
        name: configHeading,
      })
    ).toBeInTheDocument();

    expect(screen.getByRole('button', { name: 'Edit' })).toBeInTheDocument();
  });

  test('should click edit button and validate configuration details in the drawer', () => {
    renderWithThemeAndFormik<LoadBalancerCreateFormData>(
      <ConfigurationAccordion
        configuration={mockConfiguration}
        index={index}
      />,
      {
        initialValues: {
          ...initialValues,
          configurations: [mockConfiguration],
        },
        onSubmit: vi.fn(),
      }
    );

    userEvent.click(screen.getByRole('button', { name: 'Edit' }));

    expect(
      screen.getByRole('dialog', {
        name: 'Edit Configuration - test-config-label',
      })
    ).toBeInTheDocument();

    expect(
      screen.getByRole('textbox', {
        name: 'Configuration Label',
      })
    ).toHaveDisplayValue('test-config-label');

    expect(
      screen.getByRole('combobox', {
        name: 'Protocol',
      })
    ).toHaveDisplayValue('HTTP');

    expect(
      screen.getByRole('spinbutton', {
        name: 'Port',
      })
    ).toHaveDisplayValue('8080');
  });

  test('should click to expand accordion and validate configuration details', () => {
    renderWithThemeAndFormik<LoadBalancerCreateFormData>(
      <ConfigurationAccordion
        configuration={mockConfiguration}
        index={index}
      />,
      {
        initialValues: {
          ...initialValues,
          configurations: [mockConfiguration],
        },
        onSubmit: vi.fn(),
      }
    );

    userEvent.click(
      screen.getByRole('heading', {
        name: configHeading,
      })
    );

    expect(
      screen.getByRole('button', {
        name: configHeading,
      })
    ).toBeInTheDocument();

    expect(
      screen.getByRole('button', {
        name: 'route-label | 0 Rules Edit',
      })
    ).toBeInTheDocument();

    expect(
      screen.getByRole('heading', {
        name: 'Protocol',
      })
    ).toBeInTheDocument();

    expect(
      screen.getByRole('heading', {
        name: 'Port',
      })
    ).toBeInTheDocument();

    expect(
      screen.getByRole('heading', {
        name: 'TLS Certificates',
      })
    ).toBeInTheDocument();

    expect(screen.getByText('HTTP')).toBeInTheDocument();
    expect(screen.getByText('8080')).toBeInTheDocument();
  });
});
