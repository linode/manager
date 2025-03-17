import { fireEvent } from '@testing-library/react';
import * as React from 'react';

import { vpcFactory } from 'src/factories/vpcs';
import {
  mockMatchMedia,
  renderWithThemeAndRouter,
} from 'src/utilities/testHelpers';

import VPCDetail from './VPCDetail';

const queryMocks = vi.hoisted(() => ({
  useLocation: vi.fn().mockReturnValue({}),
  useNavigate: vi.fn(() => vi.fn()),
  useParams: vi.fn().mockReturnValue({}),
  useSearch: vi.fn().mockReturnValue({}),
  useVPCQuery: vi.fn().mockReturnValue({}),
}));

vi.mock('@tanstack/react-router', async () => {
  const actual = await vi.importActual('@tanstack/react-router');
  return {
    ...actual,
    useLocation: queryMocks.useLocation,
    useNavigate: queryMocks.useNavigate,
    useParams: queryMocks.useParams,
    useSearch: queryMocks.useSearch,
  };
});

beforeAll(() => mockMatchMedia());

describe('VPC Detail Summary section', () => {
  beforeEach(() => {
    queryMocks.useLocation.mockReturnValue({
      pathname: '/vpcs/1',
    });
    queryMocks.useParams.mockReturnValue({
      vpcId: 1,
    });
  });

  it('should display number of subnets and linodes, region, id, creation and update dates', async () => {
    const vpcFactory1 = vpcFactory.build({ id: 1, subnets: [] });
    queryMocks.useVPCQuery.mockReturnValue({
      data: vpcFactory1,
    });

    const { getAllByText } = await renderWithThemeAndRouter(<VPCDetail />, {
      initialRoute: '/vpcs/1',
    });

    getAllByText('Subnets');
    getAllByText('Linodes');
    getAllByText('0');

    getAllByText('Region');
    getAllByText('US, Newark, NJ');

    getAllByText('VPC ID');
    getAllByText(vpcFactory1.id);

    getAllByText('Created');
    getAllByText(vpcFactory1.created);

    getAllByText('Updated');
    getAllByText(vpcFactory1.updated);
  });

  it.only('should display description if one is provided', async () => {
    const vpcFactory1 = vpcFactory.build({
      description: `VPC for webserver and database.`,
    });
    queryMocks.useVPCQuery.mockReturnValue({
      ...vpcFactory1,
    });

    const { getByText } = await renderWithThemeAndRouter(<VPCDetail />);

    getByText('Description');
    getByText(vpcFactory1.description);
  });

  it('should hide description if none is provided', async () => {
    queryMocks.useVPCQuery.mockReturnValue({
      data: vpcFactory.build(),
    });

    const { queryByText } = await renderWithThemeAndRouter(<VPCDetail />);

    expect(queryByText('Description')).not.toBeInTheDocument();
  });

  it('should display read more/less button in description if there are more than 150 characters', async () => {
    const vpcFactory1 = vpcFactory.build({
      description: `VPC for webserver and database. VPC for webserver and database. VPC for webserver and database. VPC for webserver and database. VPC for webserver. VPC for webserver.`,
    });
    queryMocks.useVPCQuery.mockReturnValue({
      data: vpcFactory1,
    });

    const { getAllByRole } = await renderWithThemeAndRouter(<VPCDetail />);

    const readMoreButton = getAllByRole('button')[2];
    expect(readMoreButton.innerHTML).toBe('Read More');

    fireEvent.click(readMoreButton);
    expect(readMoreButton.innerHTML).toBe('Read Less');
  });

  it('should display a warning notice and disable actions if the VPC was automatically generated for a LKE-E cluster', async () => {
    const vpcFactory1 = vpcFactory.build({
      description: `workload VPC for LKE Enterprise Cluster lke1234567.`,
      label: 'lke1234567',
    });
    queryMocks.useVPCQuery.mockReturnValue({
      data: vpcFactory1,
    });

    const { getByRole, getByText } = await renderWithThemeAndRouter(
      <VPCDetail />
    );

    expect(
      getByText(
        'This VPC has been automatically generated for your LKE Enterprise cluster. Making edits is disabled to avoid disruption to cluster communication.'
      )
    ).toBeVisible();

    const editButton = getByRole('button', {
      name: 'Edit',
    });
    const deleteButton = getByRole('button', {
      name: 'Delete',
    });
    expect(editButton).toBeDisabled();
    expect(deleteButton).toBeDisabled();
  });
});
