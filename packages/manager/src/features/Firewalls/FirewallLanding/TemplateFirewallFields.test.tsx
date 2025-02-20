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
    const { getByText } = renderWithThemeAndHookFormContext({
      component: <TemplateFirewallFields {...props} />,
      useFormOptions: formOptions,
    });

    expect(
      getByText(
        'Firewall templates enable you to quickly create firewalls with reasonable firewall rules for Public and VPC interfaces that can be edited.'
      )
    ).toBeVisible();
    expect(getByText('Firewall Template')).toBeVisible();
  });
});
