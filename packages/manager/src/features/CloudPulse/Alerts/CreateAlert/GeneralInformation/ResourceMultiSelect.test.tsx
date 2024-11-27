import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';

import { linodeFactory } from 'src/factories';
import { renderWithThemeAndHookFormContext } from 'src/utilities/testHelpers';

import { CloudPulseMultiResourceSelect } from './ResourceMultiSelect';

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
const SELECT_ALL = 'Select All';
const ARIA_SELECTED = 'aria-selected';
describe('ResourceMultiSelect component tests', () => {
  it('should render disabled component if the props are undefined or regions and service type does not have any values', () => {
    const mockLinodes = linodeFactory.buildList(2);
    queryMocks.useResourcesQuery.mockReturnValue({
      data: mockLinodes,
      isError: false,
      isLoading: false,
      status: 'success',
    });
    const {
      getByPlaceholderText,
      getByTestId,
    } = renderWithThemeAndHookFormContext({
      component: (
        <CloudPulseMultiResourceSelect
          engine="mysql"
          name="entity_ids"
          region={undefined}
          serviceType={null}
        />
      ),
    });
    expect(getByTestId('resource-select')).toBeInTheDocument();
    expect(getByPlaceholderText('Select Resources')).toBeInTheDocument();
  });

  it('should render resources happy path', async () => {
    const user = userEvent.setup();
    const mockLinodes = linodeFactory.buildList(2);
    queryMocks.useResourcesQuery.mockReturnValue({
      data: mockLinodes,
      isError: false,
      isLoading: false,
      status: 'success',
    });
    renderWithThemeAndHookFormContext({
      component: (
        <CloudPulseMultiResourceSelect
          engine="mysql"
          name="entity_ids"
          region="us-east"
          serviceType="linode"
        />
      ),
    });
    user.click(screen.getByRole('button', { name: 'Open' }));
    expect(
      await screen.findByRole('option', {
        name: mockLinodes[0].label,
      })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('option', {
        name: mockLinodes[1].label,
      })
    ).toBeInTheDocument();
  });

  it('should be able to select all resources', async () => {
    const user = userEvent.setup();
    const mockLinodes = linodeFactory.buildList(2);
    queryMocks.useResourcesQuery.mockReturnValue({
      data: mockLinodes,
      isError: false,
      isLoading: false,
      status: 'success',
    });
    renderWithThemeAndHookFormContext({
      component: (
        <CloudPulseMultiResourceSelect
          engine="mysql"
          name="entity_ids"
          region="us-east"
          serviceType="linode"
        />
      ),
    });
    user.click(await screen.findByRole('button', { name: 'Open' }));
    await user.click(await screen.findByRole('option', { name: SELECT_ALL }));
    expect(
      await screen.findByRole('option', {
        name: mockLinodes[0].label,
      })
    ).toHaveAttribute(ARIA_SELECTED, 'true');
    expect(
      screen.getByRole('option', {
        name: mockLinodes[0].label,
      })
    ).toHaveAttribute(ARIA_SELECTED, 'true');
  });

  it('should be able to deselect the selected resources', async () => {
    const user = userEvent.setup();
    const mockLinodes = linodeFactory.buildList(2);
    queryMocks.useResourcesQuery.mockReturnValue({
      data: mockLinodes,
      isError: false,
      isLoading: false,
      status: 'success',
    });
    renderWithThemeAndHookFormContext({
      component: (
        <CloudPulseMultiResourceSelect
          engine="mysql"
          name="entity_ids"
          region="us-east"
          serviceType="linode"
        />
      ),
    });
    user.click(screen.getByRole('button', { name: 'Open' }));
    await user.click(await screen.findByRole('option', { name: SELECT_ALL }));
    await user.click(
      await screen.findByRole('option', { name: 'Deselect All' })
    );
    expect(
      await screen.findByRole('option', {
        name: mockLinodes[0].label,
      })
    ).toHaveAttribute(ARIA_SELECTED, 'false');
    expect(
      screen.getByRole('option', {
        name: mockLinodes[1].label,
      })
    ).toHaveAttribute(ARIA_SELECTED, 'false');
  });

  it('should select multiple resources', async () => {
    const user = userEvent.setup();
    const mockLinodes = linodeFactory.buildList(3);
    queryMocks.useResourcesQuery.mockReturnValue({
      data: mockLinodes,
      isError: false,
      isLoading: false,
      status: 'success',
    });
    renderWithThemeAndHookFormContext({
      component: (
        <CloudPulseMultiResourceSelect
          engine="mysql"
          name="entity_ids"
          region="us-east"
          serviceType="linode"
        />
      ),
    });
    user.click(screen.getByRole('button', { name: 'Open' }));
    await user.click(
      await screen.findByRole('option', { name: mockLinodes[0].label })
    );
    await user.click(
      await screen.findByRole('option', { name: mockLinodes[1].label })
    );

    expect(
      await screen.findByRole('option', {
        name: mockLinodes[0].label,
      })
    ).toHaveAttribute(ARIA_SELECTED, 'true');
    expect(
      screen.getByRole('option', {
        name: mockLinodes[1].label,
      })
    ).toHaveAttribute(ARIA_SELECTED, 'true');
    expect(
      screen.getByRole('option', {
        name: mockLinodes[2].label,
      })
    ).toHaveAttribute(ARIA_SELECTED, 'false');
    expect(
      screen.getByRole('option', {
        name: 'Select All',
      })
    ).toHaveAttribute(ARIA_SELECTED, 'false');
  });

  it('should render the label as cluster when resource is of dbaas type', () => {
    const { getByLabelText } = renderWithThemeAndHookFormContext({
      component: (
        <CloudPulseMultiResourceSelect
          engine="mysql"
          name="entity_ids"
          region="us-east"
          serviceType="dbaas"
        />
      ),
    });
    expect(getByLabelText('Clusters'));
  });

  it('should render error messages when there is an API call failure', () => {
    queryMocks.useResourcesQuery.mockReturnValue({
      data: undefined,
      isError: true,
      isLoading: false,
      status: 'error',
    });
    renderWithThemeAndHookFormContext({
      component: (
        <CloudPulseMultiResourceSelect
          engine="mysql"
          name="entity_ids"
          region="us-east"
          serviceType="linode"
        />
      ),
    });
    expect(
      screen.getByText('Failed to fetch the resources.')
    ).toBeInTheDocument();
  });
});
