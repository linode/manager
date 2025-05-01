import { linodeFactory } from '@linode/utilities';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { CloudPulseResourcesSelect } from './CloudPulseResourcesSelect';

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

const mockResourceHandler = vi.fn();
const SELECT_ALL = 'Select All';
const ARIA_SELECTED = 'aria-selected';
const ARIA_DISABLED = 'aria-disabled';

describe('CloudPulseResourcesSelect component tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    linodeFactory.resetSequenceNumber();
  });

  it('renders with the correct label and placeholder', () => {
    renderWithTheme(
      <CloudPulseResourcesSelect
        handleResourcesSelection={mockResourceHandler}
        label="Resources"
        region={'us-east'}
        resourceType={'linode'}
      />
    );

    expect(screen.getByLabelText('Resources')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Select Resources')).toBeInTheDocument();
  });

  it('should render disabled component if the props are undefined or regions and service type does not have any resources', () => {
    renderWithTheme(
      <CloudPulseResourcesSelect
        disabled
        handleResourcesSelection={mockResourceHandler}
        label="Resources"
        region={undefined}
        resourceType={undefined}
      />
    );

    expect(screen.getByTestId('textfield-input')).toBeDisabled();
  });

  it('should render resources', async () => {
    const mockLinodes = linodeFactory.buildList(2);

    queryMocks.useResourcesQuery.mockReturnValue({
      data: mockLinodes,
      isError: false,
      isLoading: false,
      status: 'success',
    });

    renderWithTheme(
      <CloudPulseResourcesSelect
        handleResourcesSelection={mockResourceHandler}
        label="Resources"
        region={'us-east'}
        resourceType={'us-east'}
      />
    );

    await userEvent.click(await screen.findByRole('button', { name: 'Open' }));

    // Check for the actual linode labels from the mock data
    expect(
      await screen.findByRole('option', { name: mockLinodes[0].label })
    ).toBeInTheDocument();

    expect(
      await screen.findByRole('option', { name: mockLinodes[1].label })
    ).toBeInTheDocument();
  });

  it('should be able to select all resources if resource selection limit is higher than number of resources', async () => {
    const mockLinodes = linodeFactory.buildList(2);
    queryMocks.useResourcesQuery.mockReturnValue({
      data: mockLinodes,
      isError: false,
      isLoading: false,
      status: 'success',
    });

    renderWithTheme(
      <CloudPulseResourcesSelect
        handleResourcesSelection={mockResourceHandler}
        label="Resources"
        region={'us-east'}
        resourceType={'linode'}
      />
    );

    await userEvent.click(await screen.findByRole('button', { name: 'Open' }));
    await userEvent.click(
      await screen.findByRole('option', { name: SELECT_ALL })
    );

    // Check that both resources are selected
    expect(
      await screen.findByRole('option', { name: mockLinodes[0].label })
    ).toHaveAttribute(ARIA_SELECTED, 'true');
    expect(
      await screen.findByRole('option', { name: mockLinodes[1].label })
    ).toHaveAttribute(ARIA_SELECTED, 'true');
  });

  it('should be able to deselect the selected resources', async () => {
    const mockLinodes = linodeFactory.buildList(2);
    queryMocks.useResourcesQuery.mockReturnValue({
      data: mockLinodes,
      isError: false,
      isLoading: false,
      status: 'success',
    });

    renderWithTheme(
      <CloudPulseResourcesSelect
        handleResourcesSelection={mockResourceHandler}
        label="Resources"
        region={'us-east'}
        resourceType={'linode'}
      />
    );

    await userEvent.click(await screen.findByRole('button', { name: 'Open' }));
    await userEvent.click(
      await screen.findByRole('option', { name: SELECT_ALL })
    );
    await userEvent.click(
      await screen.findByRole('option', { name: 'Deselect All' })
    );

    // Check that both resources are deselected
    expect(
      await screen.findByRole('option', { name: mockLinodes[0].label })
    ).toHaveAttribute(ARIA_SELECTED, 'false');
    expect(
      await screen.findByRole('option', { name: mockLinodes[1].label })
    ).toHaveAttribute(ARIA_SELECTED, 'false');
  });

  it('should select multiple resources', async () => {
    const mockLinodes = linodeFactory.buildList(3);
    queryMocks.useResourcesQuery.mockReturnValue({
      data: mockLinodes,
      isError: false,
      isLoading: false,
      status: 'success',
    });

    renderWithTheme(
      <CloudPulseResourcesSelect
        handleResourcesSelection={mockResourceHandler}
        label="Resources"
        region={'us-east'}
        resourceType={'linode'}
      />
    );

    await userEvent.click(await screen.findByRole('button', { name: 'Open' }));
    await userEvent.click(
      await screen.findByRole('option', { name: mockLinodes[0].label })
    );
    await userEvent.click(
      await screen.findByRole('option', { name: mockLinodes[1].label })
    );

    // Check that the correct resources are selected/not selected
    expect(
      await screen.findByRole('option', { name: mockLinodes[0].label })
    ).toHaveAttribute(ARIA_SELECTED, 'true');
    expect(
      await screen.findByRole('option', { name: mockLinodes[1].label })
    ).toHaveAttribute(ARIA_SELECTED, 'true');
    expect(
      await screen.findByRole('option', { name: mockLinodes[2].label })
    ).toHaveAttribute(ARIA_SELECTED, 'false');
    expect(
      await screen.findByRole('option', { name: SELECT_ALL })
    ).toHaveAttribute(ARIA_SELECTED, 'false');
  });

  it('Should select the default resource returned from preferences', () => {
    const mockLinodes = linodeFactory.buildList(2);
    const defaultId = '12';

    queryMocks.useResourcesQuery.mockReturnValue({
      data: mockLinodes,
      isError: false,
      isLoading: false,
      status: 'success',
    });

    renderWithTheme(
      <CloudPulseResourcesSelect
        defaultValue={[defaultId]}
        handleResourcesSelection={mockResourceHandler}
        label="Resources"
        region={'us-east'}
        resourceType={'linode'}
        savePreferences
      />
    );

    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('Should show appropriate error message on resources call failure', async () => {
    queryMocks.useResourcesQuery.mockReturnValue({
      data: undefined,
      isError: true,
      isLoading: false,
      status: 'error',
    });

    renderWithTheme(
      <CloudPulseResourcesSelect
        handleResourcesSelection={mockResourceHandler}
        label="Resource"
        region={'us-east'}
        resourceType={'linode'}
      />
    );
    expect(screen.getByText('Failed to fetch Resource.')).toBeInTheDocument();

    // Test with different label
    renderWithTheme(
      <CloudPulseResourcesSelect
        handleResourcesSelection={mockResourceHandler}
        label="ABC"
        region={'us-east'}
        resourceType={'linode'}
      />
    );
    expect(screen.getByText('Failed to fetch ABC.')).toBeInTheDocument();

    // Test with empty label
    renderWithTheme(
      <CloudPulseResourcesSelect
        handleResourcesSelection={mockResourceHandler}
        label=""
        region={'us-east'}
        resourceType={'linode'}
      />
    );
    expect(screen.getByText('Failed to fetch Resources.')).toBeInTheDocument();
  });

  it('should handle resource selection limits correctly', async () => {
    const user = userEvent.setup();
    const mockLinodes = linodeFactory.buildList(12);

    queryMocks.useResourcesQuery.mockReturnValue({
      data: mockLinodes,
      isError: false,
      isLoading: false,
      status: 'success',
    });

    const { queryByRole } = renderWithTheme(
      <CloudPulseResourcesSelect
        handleResourcesSelection={mockResourceHandler}
        label="Resources"
        region="us-east"
        resourceType="linode"
      />
    );

    await user.click(screen.getByRole('button', { name: 'Open' }));
    expect(screen.getByText('Select up to 10 Resources')).toBeInTheDocument();

    // Select the first 10 resources
    for (let i = 0; i < 10; i++) {
      // eslint-disable-next-line no-await-in-loop
      const option = await screen.findByRole('option', {
        name: mockLinodes[i].label,
      });
      // eslint-disable-next-line no-await-in-loop
      await user.click(option);
    }

    // Check we have 10 selected resources
    const selectedOptions = screen
      .getAllByRole('option')
      .filter((option) => option.getAttribute(ARIA_SELECTED) === 'true');
    expect(selectedOptions.length).toBe(10);

    // Check that the 11th resource is disabled
    expect(
      screen.getByRole('option', { name: mockLinodes[10].label })
    ).toHaveAttribute(ARIA_DISABLED, 'true');

    // Check "Select All" is not available when there are more resources than the limit
    expect(queryByRole('option', { name: SELECT_ALL })).not.toBeInTheDocument();
  });

  it('should handle "Select All" when resource count equals limit', async () => {
    const user = userEvent.setup();
    const mockLinodes = linodeFactory.buildList(10);

    queryMocks.useResourcesQuery.mockReturnValue({
      data: mockLinodes,
      isError: false,
      isLoading: false,
      status: 'success',
    });

    renderWithTheme(
      <CloudPulseResourcesSelect
        handleResourcesSelection={mockResourceHandler}
        label="Resources"
        region={'us-east'}
        resourceType={'linode'}
      />
    );

    await user.click(screen.getByRole('button', { name: 'Open' }));
    await user.click(screen.getByRole('option', { name: SELECT_ALL }));
    await user.click(screen.getByRole('option', { name: 'Deselect All' }));

    // Check all resources are deselected
    mockLinodes.forEach((linode) => {
      expect(
        screen.getByRole('option', { name: linode.label })
      ).toHaveAttribute(ARIA_SELECTED, 'false');
    });
  });
});
