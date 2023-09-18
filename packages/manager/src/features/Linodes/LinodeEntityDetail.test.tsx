import { AccountCapability } from '@linode/api-v4';
import { waitFor } from '@testing-library/react';
import * as React from 'react';

import {
  accountFactory,
  linodeFactory,
  subnetFactory,
  vpcFactory,
} from 'src/factories';
import { makeResourcePage } from 'src/mocks/serverHandlers';
import { rest, server } from 'src/mocks/testServer';
import { queryClientFactory } from 'src/queries/base';
import { mockMatchMedia, renderWithTheme } from 'src/utilities/testHelpers';

import { LinodeEntityDetail, getSubnetsString } from './LinodeEntityDetail';
import { LinodeHandlers } from './LinodesLanding/LinodesLanding';

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

  it('should not display a VPC section if the feature flag is off and the account capabilities do not include VPC', async () => {
    const account = accountFactory.build({
      capabilities: accountCapabilitiesWithoutVPC,
    });

    const subnet = subnetFactory.build({
      id: 2,
      linodes: [5],
    });

    const vpc = vpcFactory.build({
      subnets: [subnet],
    });

    server.use(
      rest.get('*/account', (req, res, ctx) => {
        return res(ctx.json(account));
      }),

      rest.get('*/vpcs', (req, res, ctx) => {
        return res(ctx.json(makeResourcePage([vpc])));
      })
    );

    const { queryByTestId } = renderWithTheme(
      <LinodeEntityDetail
        handlers={handlers}
        id={5}
        linode={linode}
        openTagDrawer={jest.fn()}
      />,
      {
        flags: { vpc: false },
      }
    );

    await waitFor(() => {
      expect(queryByTestId(vpcSectionTestId)).not.toBeInTheDocument();
    });
  });

  it('should not display the VPC section if the linode is not assigned to a VPC', async () => {
    const account = accountFactory.build({
      capabilities: [...accountCapabilitiesWithoutVPC, 'VPCs'],
    });

    const subnet = subnetFactory.build({
      id: 4,
      linodes: [85],
    });

    const vpc = vpcFactory.build({
      subnets: [subnet],
    });

    server.use(
      rest.get('*/account', (req, res, ctx) => {
        return res(ctx.json(account));
      }),

      rest.get('*/vpcs', (req, res, ctx) => {
        return res(ctx.json(makeResourcePage([vpc])));
      })
    );

    const { queryByTestId } = renderWithTheme(
      <LinodeEntityDetail
        handlers={handlers}
        id={5}
        linode={linode}
        openTagDrawer={jest.fn()}
      />
    );

    await waitFor(() => {
      expect(queryByTestId(vpcSectionTestId)).not.toBeInTheDocument();
    });
  });

  it('should display the VPC section if the linode is assigned to a VPC', async () => {
    const subnet = subnetFactory.build({
      id: 4,
      label: '1st-subnet',
      linodes: [linode.id],
    });

    const _vpcs = vpcFactory.buildList(3);
    const vpcs = [
      ..._vpcs,
      vpcFactory.build({ label: 'test-vpc', subnets: [subnet] }),
    ];

    server.use(
      rest.get('*/vpcs', (req, res, ctx) => {
        return res(ctx.json(makeResourcePage(vpcs)));
      })
    );

    const { getByTestId } = renderWithTheme(
      <LinodeEntityDetail
        handlers={handlers}
        id={10}
        linode={linode}
        openTagDrawer={jest.fn()}
      />,
      {
        flags: { vpc: true },
        queryClient,
      }
    );

    await waitFor(() => {
      expect(getByTestId(vpcSectionTestId)).toBeInTheDocument();
      expect(getByTestId(assignedVPCLabelTestId).innerHTML).toEqual('test-vpc');
    });
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
