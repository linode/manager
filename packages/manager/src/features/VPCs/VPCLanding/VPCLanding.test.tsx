import * as React from 'react';

import { subnetFactory } from 'src/factories';
import { vpcFactory } from 'src/factories/vpcs';
import { makeResourcePage } from 'src/mocks/serverHandlers';
import { HttpResponse, http, server } from 'src/mocks/testServer';
import {
  mockMatchMedia,
  renderWithThemeAndRouter,
} from 'src/utilities/testHelpers';

import VPCLanding from './VPCLanding';

beforeAll(() => mockMatchMedia());

describe('VPC Landing Table', () => {
  it('should render vpc landing table with items', async () => {
    server.use(
      http.get('*/vpcs', () => {
        const vpcsWithSubnet = vpcFactory.buildList(3, {
          subnets: subnetFactory.buildList(Math.floor(Math.random() * 10) + 1),
        });
        return HttpResponse.json(makeResourcePage(vpcsWithSubnet));
      })
    );

    const { getAllByText } = await renderWithThemeAndRouter(<VPCLanding />);

    // Static text and table column headers
    getAllByText('Label');
    getAllByText('Region');
    getAllByText('VPC ID');
    getAllByText('Subnets');
    getAllByText('Linodes');
  });

  it('should render vpc landing with empty state', async () => {
    server.use(
      http.get('*/vpcs', () => {
        return HttpResponse.json(makeResourcePage([]));
      })
    );

    const { getByText } = await renderWithThemeAndRouter(<VPCLanding />);

    expect(
      getByText('Create a private and isolated network')
    ).toBeInTheDocument();
  });
});
