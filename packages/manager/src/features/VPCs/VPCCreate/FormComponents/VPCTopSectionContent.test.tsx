import { waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';

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

    getByText('Region');
    getByText('VPC Label');
    getByText('Description');
    // @TODO VPC IPv6: Remove this check once VPC IPv6 is in GA
    expect(queryByText('VPC Stack Type')).not.toBeInTheDocument();
  });

  it('renders a VPC Stack Type section with IPv4 pre-checked if the vpcIpv6 feature flag is enabled', async () => {
    const { getByText, getAllByRole, queryByText } =
      renderWithThemeAndHookFormContext({
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

    getByText('Region');
    getByText('VPC Label');
    getByText('Description');

    await waitFor(() => {
      getByText('VPC Stack Type');
    });

    const radioInputs = getAllByRole('radio');
    expect(radioInputs[0]).toBeChecked(); // IPv4
    expect(radioInputs[1]).not.toBeChecked(); // Dual Stack
    getByText('IPv4 CIDR');
    expect(queryByText('IPv6 CIDR')).not.toBeInTheDocument();
  });

  it('renders a VPC Stack Type section with IPv6 CIDR if the Dual Stack option is checked when the vpcIpv6 feature flag is enabled', async () => {
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

    getByText('Region');
    getByText('VPC Label');
    getByText('Description');

    await waitFor(() => {
      getByText('VPC Stack Type');
    });

    const radioInputs = getAllByRole('radio');
    await userEvent.click(radioInputs[1]);
    getByText('IPv4 CIDR');
    getByText('IPv6 CIDR');
  });
});
