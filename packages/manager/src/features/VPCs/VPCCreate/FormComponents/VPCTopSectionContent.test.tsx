import { waitFor } from '@testing-library/react';
import * as React from 'react';

import { accountFactory } from 'src/factories';
import { http, HttpResponse, server } from 'src/mocks/testServer';
import { renderWithThemeAndHookFormContext } from 'src/utilities/testHelpers';

import { VPCTopSectionContent } from './VPCTopSectionContent';

const props = {
  regions: [],
};

describe('VPC Top Section form content', () => {
  it('renders the vpc top section form content correctly', () => {
    const { getByText, queryByText } = renderWithThemeAndHookFormContext({
      component: <VPCTopSectionContent {...props} />,
      // @TODO VPC IPv6: Remove this flag check once VPC IPv6 is in GA
      options: {
        flags: {
          vpcIpv6: false,
        },
      },
      useFormOptions: {
        defaultValues: {
          description: '',
          label: '',
          region: '',
          subnets: [],
        },
      },
    });

    expect(getByText('Region')).toBeVisible();
    expect(getByText('VPC Label')).toBeVisible();
    expect(getByText('Description')).toBeVisible();
    // @TODO VPC IPv6: Remove this check once VPC IPv6 is in GA
    expect(queryByText('VPC Stack Type')).not.toBeInTheDocument();
  });

  it('renders a VPC Stack Type section with IPv4 pre-checked if the vpcIpv6 feature flag is enabled', async () => {
    const account = accountFactory.build({
      capabilities: ['VPC Dual Stack'],
    });

    server.use(http.get('*/v4/account', () => HttpResponse.json(account)));

    const { getByText, getAllByRole } = renderWithThemeAndHookFormContext({
      component: <VPCTopSectionContent {...props} />,
      // @TODO VPC IPv6: Remove this flag check once VPC IPv6 is in GA
      options: {
        flags: {
          vpcIpv6: true,
        },
      },
      useFormOptions: {
        defaultValues: {
          description: '',
          label: '',
          region: '',
          subnets: [],
        },
      },
    });

    expect(getByText('Region')).toBeVisible();
    expect(getByText('VPC Label')).toBeVisible();
    expect(getByText('Description')).toBeVisible();

    await waitFor(() => {
      expect(getByText('VPC Stack Type')).toBeVisible();
    });

    const radioInputs = getAllByRole('radio');
    expect(radioInputs[0]).toBeChecked(); // IPv4
    expect(radioInputs[1]).not.toBeChecked(); // Dual Stack
  });
});
