import { queryClientFactory } from '@linode/queries';
import { linodeFactory } from '@linode/utilities';
import { waitFor } from '@testing-library/react';
import * as React from 'react';

import {
  accountFactory,
  firewallFactory,
  kubernetesClusterFactory,
  subnetAssignedLinodeDataFactory,
  subnetFactory,
  vpcFactory,
} from 'src/factories';
import { makeResourcePage } from 'src/mocks/serverHandlers';
import { HttpResponse, http, server } from 'src/mocks/testServer';
import { mockMatchMedia, renderWithTheme } from 'src/utilities/testHelpers';

import { encryptionStatusTestId } from '../Kubernetes/KubernetesClusterDetail/NodePoolsDisplay/NodeTable';
import { LinodeEntityDetail } from './LinodeEntityDetail';
import { getSubnetsString } from './LinodeEntityDetailBody';

import type { LinodeHandlers } from './LinodesLanding/LinodesLanding';
import type { AccountCapability } from '@linode/api-v4';

const queryClient = queryClientFactory();

beforeAll(() => mockMatchMedia());
afterEach(() => {
  queryClient.clear();
});

describe('Linode Entity Detail', () => {
  const linode = linodeFactory.build({
    id: 5,
  });

  const handlers = {} as LinodeHandlers;

  const vpcSectionTestId = 'vpc-section-title';
  const assignedVPCLabelTestId = 'assigned-vpc-label';
  const assignedLKEClusterLabelTestId = 'assigned-lke-cluster-label';
  const assignedFirewallTestId = 'assigned-firewall';

  const mocks = vi.hoisted(() => {
    return {
      useIsDiskEncryptionFeatureEnabled: vi.fn(),
    };
  });

  vi.mock('src/components/Encryption/utils.ts', async () => {
    const actual = await vi.importActual<any>(
      'src/components/Encryption/utils.ts'
    );
    return {
      ...actual,
      __esModule: true,
      useIsDiskEncryptionFeatureEnabled: mocks.useIsDiskEncryptionFeatureEnabled.mockImplementation(
        () => {
          return {
            isDiskEncryptionFeatureEnabled: false, // indicates the feature flag is off or account capability is absent
          };
        }
      ),
    };
  });

  it('should not display the VPC section if the linode is not assigned to a VPC', async () => {
    const account = accountFactory.build({
      capabilities: [...accountCapabilitiesWithoutVPC, 'VPCs'],
    });

    const subnet = subnetFactory.build({
      id: 4,
      linodes: [subnetAssignedLinodeDataFactory.build({ id: 85 })],
    });

    const vpc = vpcFactory.build({
      subnets: [subnet],
    });

    server.use(
      http.get('*/account', () => {
        return HttpResponse.json(account);
      }),

      http.get('*/vpcs/:vpcId', () => {
        return HttpResponse.json(vpc);
      })
    );

    const { queryByTestId } = renderWithTheme(
      <LinodeEntityDetail handlers={handlers} id={5} linode={linode} />
    );

    await waitFor(() => {
      expect(queryByTestId(vpcSectionTestId)).not.toBeInTheDocument();
    });
  });

  it('should display the VPC section if the linode is assigned to a VPC', async () => {
    const subnet = subnetFactory.build({
      id: 4,
      label: '1st-subnet',
      linodes: [subnetAssignedLinodeDataFactory.build({ id: linode.id })],
    });

    const vpc = vpcFactory.build({ label: 'test-vpc', subnets: [subnet] });

    server.use(
      http.get('*/vpcs/:vpcId', () => {
        return HttpResponse.json(vpc);
      })
    );

    const { findByTestId } = renderWithTheme(
      <LinodeEntityDetail handlers={handlers} id={10} linode={linode} />,
      {
        queryClient,
      }
    );

    const vpcSection = await findByTestId(vpcSectionTestId);
    const vpcLabel = await findByTestId(assignedVPCLabelTestId);

    expect(vpcSection).toBeInTheDocument();
    expect(vpcLabel.innerHTML).toEqual('test-vpc');
  });

  it('should not display the LKE section if the linode is not associated with an LKE cluster', async () => {
    const { queryByTestId } = renderWithTheme(
      <LinodeEntityDetail handlers={handlers} id={5} linode={linode} />
    );

    await waitFor(() => {
      expect(
        queryByTestId(assignedLKEClusterLabelTestId)
      ).not.toBeInTheDocument();
    });
  });

  it('should display the LKE section if the linode is associated with an LKE cluster', async () => {
    const mockLKELinode = linodeFactory.build({ lke_cluster_id: 42 });

    const mockCluster = kubernetesClusterFactory.build({
      id: 42,
      label: 'test-cluster',
    });

    server.use(
      http.get('*/lke/clusters/:clusterId', () => {
        return HttpResponse.json(mockCluster);
      })
    );

    const { getByTestId } = renderWithTheme(
      <LinodeEntityDetail handlers={handlers} id={10} linode={mockLKELinode} />,
      {
        queryClient,
      }
    );

    await waitFor(() => {
      expect(getByTestId(assignedLKEClusterLabelTestId)).toBeInTheDocument();
      expect(getByTestId(assignedLKEClusterLabelTestId).innerHTML).toEqual(
        'test-cluster'
      );
    });
  });

  it('should display a link to the assigned firewall if it exists for a Linode with configuration profile interfaces', async () => {
    const mockFirewall = firewallFactory.build({ label: 'test-firewall' });
    const mockLinode = linodeFactory.build();
    server.use(
      http.get('*/linode/instances/:linodeId/firewalls', () => {
        return HttpResponse.json(makeResourcePage([mockFirewall]));
      })
    );

    const { getByTestId } = renderWithTheme(
      <LinodeEntityDetail
        handlers={handlers}
        id={mockLinode.id}
        linode={mockLinode}
      />
    );

    await waitFor(() => {
      expect(getByTestId(assignedFirewallTestId)).toBeVisible();
      expect(getByTestId(assignedFirewallTestId).innerHTML).toEqual(
        'test-firewall'
      );
    });
  });

  it('should not display a link to an assigned firewall if no firewall exists', async () => {
    const mockLinode = linodeFactory.build();
    server.use(
      http.get('*/linode/instances/:linodeId/firewalls', () => {
        return HttpResponse.json(makeResourcePage([]));
      })
    );

    const { queryByTestId } = renderWithTheme(
      <LinodeEntityDetail
        handlers={handlers}
        id={mockLinode.id}
        linode={mockLinode}
      />
    );

    await waitFor(() => {
      expect(queryByTestId(assignedFirewallTestId)).not.toBeInTheDocument();
    });
  });

  it('should display the interface type for a Linode with configuration profile interfaces', async () => {
    const mockLinode = linodeFactory.build();
    server.use(
      http.get('*/linode/instances/:linodeId', () => {
        return HttpResponse.json(mockLinode);
      })
    );

    const { getByText } = renderWithTheme(
      <LinodeEntityDetail
        handlers={handlers}
        id={mockLinode.id}
        linode={mockLinode}
      />,
      {
        flags: {
          linodeInterfaces: { enabled: true },
        },
      }
    );

    await waitFor(() => {
      expect(getByText('Configuration Profile')).toBeVisible();
    });
  });

  it('should display the interface type for a Linode with Linode interfaces and does not display firewall link', async () => {
    const mockLinode = linodeFactory.build({ interface_generation: 'linode' });
    const mockFirewall = firewallFactory.build({ label: 'test-firewall' });
    server.use(
      http.get('*/linode/instances/:linodeId', () => {
        return HttpResponse.json(mockLinode);
      }),
      http.get('*/linode/instances/:linodeId/firewalls', () => {
        return HttpResponse.json(makeResourcePage([mockFirewall]));
      })
    );

    const { getByText, queryByTestId } = renderWithTheme(
      <LinodeEntityDetail
        handlers={handlers}
        id={mockLinode.id}
        linode={mockLinode}
      />,
      {
        flags: {
          linodeInterfaces: { enabled: true },
        },
      }
    );

    await waitFor(() => {
      expect(getByText('Linode')).toBeVisible();
      expect(queryByTestId(assignedFirewallTestId)).not.toBeInTheDocument();
    });
  });

  it('should not display the encryption status of the linode if the account lacks the capability or the feature flag is off', () => {
    // situation where isDiskEncryptionFeatureEnabled === false
    const { queryByTestId } = renderWithTheme(
      <LinodeEntityDetail handlers={handlers} id={10} linode={linode} />
    );
    const encryptionStatusFragment = queryByTestId(encryptionStatusTestId);

    expect(encryptionStatusFragment).not.toBeInTheDocument();
  });

  it('should display the encryption status of the linode when Disk Encryption is enabled and the user has the account capability', () => {
    mocks.useIsDiskEncryptionFeatureEnabled.mockImplementationOnce(() => {
      return {
        isDiskEncryptionFeatureEnabled: true,
      };
    });

    const { queryByTestId } = renderWithTheme(
      <LinodeEntityDetail handlers={handlers} id={10} linode={linode} />
    );
    const encryptionStatusFragment = queryByTestId(encryptionStatusTestId);

    expect(encryptionStatusFragment).toBeInTheDocument();
  });
});

describe('getSubnetsString function', () => {
  const subnet1 = subnetFactory.build({
    label: 'first-subnet',
  });

  const subnet2 = subnetFactory.build({
    label: 'second-subnet',
  });

  const subnet3 = subnetFactory.build({
    label: 'third-subnet',
  });

  it('lists out in full up to three subnets', () => {
    const subnets = [subnet1, subnet2, subnet3];

    expect(getSubnetsString(subnets)).toEqual(
      'first-subnet, second-subnet, third-subnet'
    );
  });

  it('truncates longer lists by naming first three subnets and having "plus X more" verbiage', () => {
    const moreSubnets = subnetFactory.buildList(5);

    const subnets = [subnet1, subnet2, subnet3, ...moreSubnets];

    expect(getSubnetsString(subnets)).toEqual(
      'first-subnet, second-subnet, third-subnet, plus 5 more.'
    );
  });
});

const accountCapabilitiesWithoutVPC: AccountCapability[] = [
  'Linodes',
  'NodeBalancers',
  'Block Storage',
  'Object Storage',
  'Kubernetes',
  'Cloud Firewall',
];
