import { linodeInterfaceFactoryVPC } from '@linode/utilities';
import * as React from 'react';

import {
  subnetAssignedLinodeDataFactory,
  subnetFactory,
  vpcFactory,
} from 'src/factories';
import { mockMatchMedia, renderWithTheme } from 'src/utilities/testHelpers';

import { LinodeEntityDetailBody } from './LinodeEntityDetailBody';

import type { BodyProps } from './LinodeEntityDetailBody';

beforeAll(() => mockMatchMedia());

const queryMocks = vi.hoisted(() => ({
  useAccount: vi.fn().mockReturnValue({}),
}));

vi.mock('@linode/queries', async () => {
  const actual = await vi.importActual('@linode/queries');
  return {
    ...actual,
    useAccount: queryMocks.useAccount,
  };
});

describe('LinodeEntityDetailBody', () => {
  const baseProps: BodyProps = {
    encryptionStatus: 'enabled',
    gbRAM: 4,
    gbStorage: 80,
    interfaceGeneration: 'linode',
    ipv4: ['192.0.2.1'],
    ipv6: '2600:0000:0000:0000:0000:0000:0000:0000',
    isUnreachablePublicIPv4: false,
    isUnreachablePublicIPv6: false,
    linodeCapabilities: [],
    linodeId: 1,
    linodeIsInDistributedRegion: false,
    linodeLabel: 'test-linode',
    linodeLkeClusterId: null,
    numCPUs: 2,
    numVolumes: 0,
    region: 'us-east',
  };

  it('does not render VPC section if linode is not assigned to a VPC', () => {
    const props: BodyProps = {
      ...baseProps,
      vpcLinodeIsAssignedTo: undefined,
    };

    const { queryByTestId } = renderWithTheme(
      <LinodeEntityDetailBody {...props} />
    );
    expect(queryByTestId('vpc-section-title')).not.toBeInTheDocument();
  });

  it('renders VPC IPv4 for a linode assigned to an IPv4-only VPC', () => {
    const subnet = subnetFactory.build({
      id: 1,
      linodes: [subnetAssignedLinodeDataFactory.build({ id: 1 })],
    });

    const vpc = vpcFactory.build({
      id: 1,
      label: 'ipv4-vpc',
      subnets: [subnet],
    });

    const linodeInterfaceVPC = linodeInterfaceFactoryVPC.build({
      vpc: {
        ipv4: {
          addresses: [{ address: '10.0.0.1', primary: true }],
          ranges: [],
        },
        ipv6: undefined,
      },
    });

    const props: BodyProps = {
      ...baseProps,
      vpcLinodeIsAssignedTo: vpc,
      interfaceWithVPC: linodeInterfaceVPC,
    } as BodyProps;

    // @TODO VPC IPv6: Once the feature is fully rolled out, remove feature flag
    const { getByTestId, queryByTestId } = renderWithTheme(
      <LinodeEntityDetailBody {...props} />,
      { flags: { vpcIpv6: true } }
    );
    getByTestId('vpc-ipv4');
    expect(queryByTestId('vpc-ipv6')).not.toBeInTheDocument();
  });

  it('renders VPC IPv4 and VPC IPv6 for a linode assigned to a Dual Stack VPC', () => {
    queryMocks.useAccount.mockReturnValue({
      data: {
        capabilities: ['VPC Dual Stack'],
      },
    });

    const subnet = subnetFactory.build({
      id: 1,
      linodes: [subnetAssignedLinodeDataFactory.build({ id: 1 })],
    });

    const vpc = vpcFactory.build({
      id: 1,
      label: 'dualstack-vpc',
      subnets: [subnet],
    });

    const linodeInterfaceVPC = linodeInterfaceFactoryVPC.build({
      vpc: {
        ipv4: {
          addresses: [{ address: '10.0.0.1', primary: true }],
          ranges: [],
        },
        ipv6: {
          slaac: [
            {
              address: '2600:3c03::f03c:91ff:fe0a:109a',
              range: '2600:3c03::/64',
            },
          ],
          ranges: [{ range: '2600:3c03::/64' }],
          is_public: false,
        },
      },
    });

    const props: BodyProps = {
      ...baseProps,
      vpcLinodeIsAssignedTo: vpc,
      interfaceWithVPC: linodeInterfaceVPC,
    } as BodyProps;

    // @TODO VPC IPv6: Once the feature is fully rolled out, remove feature flag
    // vpcIpv6 flag enabled
    const { getByTestId } = renderWithTheme(
      <LinodeEntityDetailBody {...props} />,
      {
        flags: { vpcIpv6: true },
      }
    );

    getByTestId('vpc-ipv4');
    getByTestId('vpc-ipv6');
  });

  // @TODO VPC IPv6: Once the feature is fully rolled out, remove this assertion
  it('does not render VPC IPv6 for a Dual Stack VPC if the feature flag is off', () => {
    const subnet = subnetFactory.build({
      id: 1,
      linodes: [subnetAssignedLinodeDataFactory.build({ id: 1 })],
    });

    const vpc = vpcFactory.build({
      id: 1,
      label: 'dualstack-vpc',
      subnets: [subnet],
    });

    const linodeInterfaceVPC = linodeInterfaceFactoryVPC.build({
      vpc: {
        ipv4: {
          addresses: [{ address: '10.0.0.1', primary: true }],
          ranges: [],
        },
        ipv6: {
          slaac: [
            {
              address: '2600:3c03::f03c:91ff:fe0a:109a',
              range: '2600:3c03::/64',
            },
          ],
          ranges: [{ range: '2600:3c03::/64' }],
          is_public: false,
        },
      },
    });

    const props: BodyProps = {
      ...baseProps,
      vpcLinodeIsAssignedTo: vpc,
      interfaceWithVPC: linodeInterfaceVPC,
    } as BodyProps;

    const { queryByTestId } = renderWithTheme(
      <LinodeEntityDetailBody {...props} />,
      {
        flags: { vpcIpv6: false },
      }
    );

    expect(queryByTestId('vpc-ipv6')).not.toBeInTheDocument();
  });
});
