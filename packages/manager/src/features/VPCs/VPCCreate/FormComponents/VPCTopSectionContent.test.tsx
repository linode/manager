import * as React from 'react';

import { renderWithThemeAndHookFormContext } from 'src/utilities/testHelpers';

import { VPCTopSectionContent } from './VPCTopSectionContent';

const queryMocks = vi.hoisted(() => ({
  useFlags: vi.fn().mockReturnValue({}),
}));

vi.mock('src/hooks/useFlags', () => {
  const actual = vi.importActual('src/hooks/useFlags');
  return {
    ...actual,
    useFlags: queryMocks.useFlags,
  };
});

const props = {
  regions: [],
};

describe('VPC Top Section form content', () => {
  it('renders the vpc top section form content correctly', () => {
    const { getByText, queryByText } = renderWithThemeAndHookFormContext({
      component: <VPCTopSectionContent {...props} />,
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

    // @TODO VPC IPv6: Remove this flag check once VPC IPv6 is in GA
    queryMocks.useFlags.mockReturnValue({ vpcIpv6: false });
    expect(queryByText('VPC Stack Type')).not.toBeInTheDocument();
  });

  it('renders the vpc top section form content with VPC Stack Type section if vpcIpv6 feature flag is enabled', () => {
    const { getByText } = renderWithThemeAndHookFormContext({
      component: <VPCTopSectionContent {...props} />,
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

    // @TODO VPC IPv6: Remove this flag check once VPC IPv6 is in GA
    queryMocks.useFlags.mockReturnValue({ vpcIpv6: true });
    getByText('VPC Stack Type');
  });
});
