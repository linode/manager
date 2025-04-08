import { fireEvent, waitForElementToBeRemoved } from '@testing-library/react';
import * as React from 'react';

import { vpcFactory } from 'src/factories/vpcs';
import { HttpResponse, http, server } from 'src/mocks/testServer';
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

const loadingTestId = 'circle-progress';

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
    server.use(
      http.get('*/vpcs/:vpcId', () => {
        return HttpResponse.json(vpcFactory1);
      })
    );

    const { getAllByText, queryByTestId } = await renderWithThemeAndRouter(
      <VPCDetail />
    );

    const loadingState = queryByTestId(loadingTestId);
    if (loadingState) {
      await waitForElementToBeRemoved(loadingState);
    }

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

  it('should display description if one is provided', async () => {
    const vpcFactory1 = vpcFactory.build({
      description: `VPC for webserver and database.`,
    });
    server.use(
      http.get('*/vpcs/:vpcId', () => {
        return HttpResponse.json(vpcFactory1);
      })
    );

    const { getByText, queryByTestId } = await renderWithThemeAndRouter(
      <VPCDetail />
    );

    const loadingState = queryByTestId(loadingTestId);
    if (loadingState) {
      await waitForElementToBeRemoved(loadingState);
    }

    getByText('Description');
    getByText(vpcFactory1.description);
  });

  it('should hide description if none is provided', async () => {
    server.use(
      http.get('*/vpcs/:vpcId', () => {
        return HttpResponse.json(vpcFactory.build());
      })
    );

    const { queryByTestId, queryByText } = await renderWithThemeAndRouter(
      <VPCDetail />
    );

    const loadingState = queryByTestId(loadingTestId);
    if (loadingState) {
      await waitForElementToBeRemoved(loadingState);
    }

    expect(queryByText('Description')).not.toBeInTheDocument();
  });

  it('should display read more/less button in description if there are more than 150 characters', async () => {
    const vpcFactory1 = vpcFactory.build({
      description: `VPC for webserver and database. VPC for webserver and database. VPC for webserver and database. VPC for webserver and database. VPC for webserver. VPC for webserver.`,
    });
    server.use(
      http.get('*/vpcs/:vpcId', () => {
        return HttpResponse.json(vpcFactory1);
      })
    );

    const { getAllByRole, queryByTestId } = await renderWithThemeAndRouter(
      <VPCDetail />
    );

    const loadingState = queryByTestId(loadingTestId);
    if (loadingState) {
      await waitForElementToBeRemoved(loadingState);
    }

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
    server.use(
      http.get('*/vpcs/:vpcId', () => {
        return HttpResponse.json(vpcFactory1);
      })
    );

    const {
      getByRole,
      getByText,
      queryByTestId,
    } = await renderWithThemeAndRouter(<VPCDetail />);

    const loadingState = queryByTestId(loadingTestId);
    if (loadingState) {
      await waitForElementToBeRemoved(loadingState);
    }

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
