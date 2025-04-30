import * as React from 'react';

import { renderWithThemeAndHookFormContext } from 'src/utilities/testHelpers';

import { TemplateFirewallFields } from './TemplateFirewallFields';

const props = {
  userCannotAddFirewall: false,
};

const formOptions = {
  defaultValues: {
    createFirewallFrom: 'template',
    devices: {
      linodes: [],
      nodebalancers: [],
    },
    label: '',
    rules: {
      inbound_policy: 'DROP',
      outbound_policy: 'ACCEPT',
    },
    templateSlug: undefined,
  },
};

describe('CustomFirewallFields', () => {
  it('renders the custom firewall fields', () => {
    const { getByText, queryByTestId } = renderWithThemeAndHookFormContext({
      component: <TemplateFirewallFields {...props} />,
      useFormOptions: formOptions,
    });

    expect(
      getByText(
        'Customizable templates are available for both VPC and Public Linode Interfaces. Each comes with pre-configured firewall rules to help you get started.'
      )
    ).toBeVisible();
    expect(getByText('Firewall Template')).toBeVisible();

    expect(queryByTestId('vpc-template-info')).not.toBeInTheDocument();
    expect(queryByTestId('public-template-info')).not.toBeInTheDocument();
  });

  it('renders information for public templates if public is selected', () => {
    const { queryByTestId } = renderWithThemeAndHookFormContext({
      component: <TemplateFirewallFields {...props} />,
      useFormOptions: {
        defaultValues: {
          ...formOptions.defaultValues,
          templateSlug: 'public',
        },
      },
    });

    expect(queryByTestId('public-template-info')).toBeVisible();
    expect(queryByTestId('vpc-template-info')).not.toBeInTheDocument();
  });

  it('renders information for vpc templates if vpc is selected', () => {
    const { queryByTestId } = renderWithThemeAndHookFormContext({
      component: <TemplateFirewallFields {...props} />,
      useFormOptions: {
        defaultValues: {
          ...formOptions.defaultValues,
          templateSlug: 'vpc',
        },
      },
    });

    expect(queryByTestId('vpc-template-info')).toBeVisible();
    expect(queryByTestId('public-template-info')).not.toBeInTheDocument();
  });
});
