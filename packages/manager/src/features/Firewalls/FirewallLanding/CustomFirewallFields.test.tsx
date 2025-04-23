import * as React from 'react';

import { renderWithThemeAndHookFormContext } from 'src/utilities/testHelpers';

import { CustomFirewallFields } from './CustomFirewallFields';

import type { LinodeCreateFormEventOptions } from 'src/utilities/analytics/types';

const props = {
  createFlow: undefined,
  firewallFormEventOptions: {
    createType: 'OS',
    headerName: 'Create Fireall',
    interaction: 'click',
    label: '',
  } as LinodeCreateFormEventOptions,
  isFromLinodeCreate: false,
  open: true,
  userCannotAddFirewall: false,
};

const formOptions = {
  defaultValues: {
    createFirewallFrom: 'custom',
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
      component: <CustomFirewallFields {...props} />,
      useFormOptions: formOptions,
    });

    expect(getByText('Default Inbound Policy')).toBeVisible();
    expect(getByText('Default Outbound Policy')).toBeVisible();
    expect(getByText('Assign services to the Firewall')).toBeVisible();
    expect(getByText('Linodes')).toBeVisible();
    expect(getByText('NodeBalancers')).toBeVisible();
  });
});
