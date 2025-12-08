import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { CloudPulseEndpointsSelect } from './CloudPulseEndpointsSelect';

import type { CloudPulseResources } from './CloudPulseResourcesSelect';

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
const ARIA_DISABLED = 'aria-disabled';

const mockEndpoints: CloudPulseResources[] = [
  {
    id: 'us-east-1.linodeobjects.com',
    label: 'us-east-1.linodeobjects.com',
    region: 'us-east',
  },
  {
    id: 'us-east-2.linodeobjects.com',
    label: 'us-east-2.linodeobjects.com',
    region: 'us-east',
  },
  {
    id: 'br-gru-1.linodeobjects.com',
    label: 'br-gru-1.linodeobjects.com',
    region: 'us-east',
  },
];

const exceedingmockEndpoints: CloudPulseResources[] = Array.from(
  { length: 8 },
  (_, i) => {
    const idx = i + 1;
    return {
      id: `us-east-bucket-${idx}.com`,
      label: `us-east-bucket-${idx}.com`,
      region: 'us-east',
    };
  }
);

describe('CloudPulseEndpointsSelect component tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    queryMocks.useResourcesQuery.mockReturnValue({
      data: mockEndpoints,
      isError: false,
      isLoading: false,
      status: 'success',
    });
  });

  it('renders with the correct label and placeholder', () => {
    renderWithTheme(
      <CloudPulseEndpointsSelect
        dashboardId={10}
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
        dashboardId={10}
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
    renderWithTheme(
      <CloudPulseEndpointsSelect
        dashboardId={10}
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
        name: mockEndpoints[0].id,
      })
    ).toBeVisible();

    expect(
      await screen.findByRole('option', {
        name: mockEndpoints[1].id,
      })
    ).toBeVisible();
  });

  it('should be able to deselect the selected endpoints', async () => {
    renderWithTheme(
      <CloudPulseEndpointsSelect
        dashboardId={10}
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
        name: mockEndpoints[0].id,
      })
    ).toHaveAttribute(ARIA_SELECTED, 'false');
    expect(
      await screen.findByRole('option', {
        name: mockEndpoints[1].id,
      })
    ).toHaveAttribute(ARIA_SELECTED, 'false');
  });

  it('should select multiple endpoints', async () => {
    renderWithTheme(
      <CloudPulseEndpointsSelect
        dashboardId={10}
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
        name: mockEndpoints[0].id,
      })
    );
    await userEvent.click(
      await screen.findByRole('option', {
        name: mockEndpoints[1].id,
      })
    );

    // Check that the correct endpoints are selected/not selected
    expect(
      await screen.findByRole('option', {
        name: mockEndpoints[0].id,
      })
    ).toHaveAttribute(ARIA_SELECTED, 'true');
    expect(
      await screen.findByRole('option', {
        name: mockEndpoints[1].id,
      })
    ).toHaveAttribute(ARIA_SELECTED, 'true');
    expect(
      await screen.findByRole('option', {
        name: mockEndpoints[2].id,
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
        dashboardId={10}
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

  it('should handle endpoints selection limits correctly', async () => {
    const user = userEvent.setup();

    const allmockEndpoints = [...mockEndpoints, ...exceedingmockEndpoints];

    queryMocks.useResourcesQuery.mockReturnValue({
      data: allmockEndpoints,
      isError: false,
      isLoading: false,
      status: 'success',
    });

    const { queryByRole } = renderWithTheme(
      <CloudPulseEndpointsSelect
        dashboardId={10}
        handleEndpointsSelection={mockEndpointHandler}
        hasRestrictedSelections={true}
        label="Endpoints"
        region="us-east"
        serviceType="objectstorage"
        xFilter={{ region: 'us-east' }}
      />
    );

    await user.click(screen.getByRole('button', { name: 'Open' }));
    expect(screen.getByText('Select up to 10 Endpoints')).toBeVisible();

    // Select the first 10 endpoints
    for (let i = 0; i < 10; i++) {
      const option = await screen.findByRole('option', {
        name: allmockEndpoints[i].id,
      });
      await user.click(option);
    }

    // Check if we have 10 selected endpoints
    const selectedOptions = screen
      .getAllByRole('option')
      .filter((option) => option.getAttribute(ARIA_SELECTED) === 'true');
    expect(selectedOptions.length).toBe(10);

    // Check that the 11th endpoint is disabled
    expect(
      screen.getByRole('option', { name: allmockEndpoints[10].id })
    ).toHaveAttribute(ARIA_DISABLED, 'true');

    // Check "Select All" is not available when there are more endpoints than the limit
    expect(queryByRole('option', { name: SELECT_ALL })).not.toBeInTheDocument();
  });

  it('should handle "Select All" when resource count equals limit', async () => {
    const user = userEvent.setup();

    queryMocks.useResourcesQuery.mockReturnValue({
      data: [...mockEndpoints, ...exceedingmockEndpoints.slice(0, 7)],
      isError: false,
      isLoading: false,
      status: 'success',
    });

    renderWithTheme(
      <CloudPulseEndpointsSelect
        dashboardId={10}
        handleEndpointsSelection={mockEndpointHandler}
        hasRestrictedSelections={true}
        label="Endpoints"
        region={'us-east'}
        serviceType={'objectstorage'}
        xFilter={{ region: 'us-east' }}
      />
    );

    await user.click(screen.getByRole('button', { name: 'Open' }));
    await user.click(screen.getByRole('option', { name: SELECT_ALL }));
    await user.click(screen.getByRole('option', { name: 'Deselect All' }));

    // Check all endpoints are deselected
    mockEndpoints.forEach((endpoint) => {
      expect(screen.getByRole('option', { name: endpoint.id })).toHaveAttribute(
        ARIA_SELECTED,
        'false'
      );
    });
  });
});
