import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';

import { objectStorageBucketFactory } from 'src/factories';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { CloudPulseEndpointsSelect } from './CloudPulseEndpointsSelect';

const queryMocks = vi.hoisted(() => ({
  useResourcesQuery: vi.fn().mockReturnValue({}),
}));

vi.mock('src/queries/cloudpulse/resources', async () => {
  const actual = await vi.importActual('src/queries/cloudpulse/resources');
  return {
    ...actual,
    useResourcesQuery: queryMocks.useResourcesQuery,
  };
});

const mockEndpointHandler = vi.fn();
const SELECT_ALL = 'Select All';
const ARIA_SELECTED = 'aria-selected';

const mockBuckets = [
  {
    ...objectStorageBucketFactory.build({
      s3_endpoint: 'us-east-1.linodeobjects.com',
      endpoint_type: 'E3',
    }),
    endpoint: 'us-east-1.linodeobjects.com',
  },
  {
    ...objectStorageBucketFactory.build({
      s3_endpoint: 'us-east-2.linodeobjects.com',
      endpoint_type: 'E3',
    }),
    endpoint: 'us-east-2.linodeobjects.com',
  },
  {
    ...objectStorageBucketFactory.build({
      s3_endpoint: 'br-gru-1.linodeobjects.com',
      endpoint_type: 'E3',
    }),
    endpoint: 'br-gru-1.linodeobjects.com',
  },
];

describe('CloudPulseEndpointsSelect component tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    objectStorageBucketFactory.resetSequenceNumber();
  });

  it('renders with the correct label and placeholder', () => {
    renderWithTheme(
      <CloudPulseEndpointsSelect
        handleEndpointsSelection={mockEndpointHandler}
        label="Endpoints"
        region={'us-east'}
        serviceType={'objectstorage'}
      />
    );

    expect(screen.getByLabelText('Endpoints')).toBeVisible();
    expect(screen.getByPlaceholderText('Select Endpoints')).toBeVisible();
  });

  it('should render disabled component if the props are undefined', () => {
    renderWithTheme(
      <CloudPulseEndpointsSelect
        disabled
        handleEndpointsSelection={mockEndpointHandler}
        label="Endpoints"
        region={undefined}
        serviceType={undefined}
      />
    );

    expect(screen.getByTestId('textfield-input')).toBeDisabled();
  });

  it('should render endpoints', async () => {
    queryMocks.useResourcesQuery.mockReturnValue({
      data: mockBuckets,
      isError: false,
      isLoading: false,
      status: 'success',
    });

    renderWithTheme(
      <CloudPulseEndpointsSelect
        handleEndpointsSelection={mockEndpointHandler}
        label="Endpoints"
        region={'us-east'}
        serviceType="objectstorage"
        xFilter={{ region: 'us-east' }}
      />
    );

    await userEvent.click(await screen.findByRole('button', { name: 'Open' }));

    expect(
      await screen.findByRole('option', {
        name: mockBuckets[0].s3_endpoint ?? '',
      })
    ).toBeVisible();

    expect(
      await screen.findByRole('option', {
        name: mockBuckets[1].s3_endpoint ?? '',
      })
    ).toBeVisible();
  });

  it('should be able to deselect the selected endpoints', async () => {
    queryMocks.useResourcesQuery.mockReturnValue({
      data: mockBuckets,
      isError: false,
      isLoading: false,
      status: 'success',
    });

    renderWithTheme(
      <CloudPulseEndpointsSelect
        handleEndpointsSelection={mockEndpointHandler}
        label="Endpoints"
        region={'us-east'}
        serviceType={'objectstorage'}
        xFilter={{ region: 'us-east' }}
      />
    );

    await userEvent.click(await screen.findByRole('button', { name: 'Open' }));
    await userEvent.click(
      await screen.findByRole('option', { name: SELECT_ALL })
    );
    await userEvent.click(
      await screen.findByRole('option', { name: 'Deselect All' })
    );

    // Check that both endpoints are deselected
    expect(
      await screen.findByRole('option', {
        name: mockBuckets[0].s3_endpoint ?? '',
      })
    ).toHaveAttribute(ARIA_SELECTED, 'false');
    expect(
      await screen.findByRole('option', {
        name: mockBuckets[1].s3_endpoint ?? '',
      })
    ).toHaveAttribute(ARIA_SELECTED, 'false');
  });

  it('should select multiple endpoints', async () => {
    queryMocks.useResourcesQuery.mockReturnValue({
      data: mockBuckets,
      isError: false,
      isLoading: false,
      status: 'success',
    });

    renderWithTheme(
      <CloudPulseEndpointsSelect
        handleEndpointsSelection={mockEndpointHandler}
        label="Endpoints"
        region={'us-east'}
        serviceType={'objectstorage'}
        xFilter={{ region: 'us-east' }}
      />
    );

    await userEvent.click(await screen.findByRole('button', { name: 'Open' }));
    await userEvent.click(
      await screen.findByRole('option', {
        name: mockBuckets[0].s3_endpoint ?? '',
      })
    );
    await userEvent.click(
      await screen.findByRole('option', {
        name: mockBuckets[1].s3_endpoint ?? '',
      })
    );

    // Check that the correct endpoints are selected/not selected
    expect(
      await screen.findByRole('option', {
        name: mockBuckets[0].s3_endpoint ?? '',
      })
    ).toHaveAttribute(ARIA_SELECTED, 'true');
    expect(
      await screen.findByRole('option', {
        name: mockBuckets[1].s3_endpoint ?? '',
      })
    ).toHaveAttribute(ARIA_SELECTED, 'true');
    expect(
      await screen.findByRole('option', {
        name: mockBuckets[2].s3_endpoint ?? '',
      })
    ).toHaveAttribute(ARIA_SELECTED, 'false');
    expect(
      await screen.findByRole('option', { name: SELECT_ALL })
    ).toHaveAttribute(ARIA_SELECTED, 'false');
  });

  it('should show appropriate error message on endpoints call failure', async () => {
    queryMocks.useResourcesQuery.mockReturnValue({
      data: undefined,
      isError: true,
      isLoading: false,
      status: 'error',
    });

    renderWithTheme(
      <CloudPulseEndpointsSelect
        handleEndpointsSelection={mockEndpointHandler}
        label="Endpoints"
        region={'us-east'}
        serviceType={'objectstorage'}
      />
    );
    expect(
      await waitFor(() => {
        return screen.findByText('Failed to fetch Endpoints.');
      })
    ).toBeVisible();
  });
});
