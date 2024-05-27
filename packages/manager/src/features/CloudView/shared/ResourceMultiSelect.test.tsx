import { fireEvent, screen } from '@testing-library/react';
import * as React from 'react';

import { linodeFactory, loadbalancerFactory } from 'src/factories';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { CloudViewMultiResourceSelect } from './ResourceMultiSelect';

const queryMocks = vi.hoisted(() => ({
  useLinodeResourcesQuery: vi.fn().mockReturnValue({}),
  useLoadBalancerResourcesQuery: vi.fn().mockReturnValue({}),
}));

vi.mock('src/queries/cloudview/resources', async () => {
  const actual = await vi.importActual('src/queries/cloudview/resources');
  return {
    ...actual,
    useLinodeResourcesQuery: queryMocks.useLinodeResourcesQuery,
    useLoadBalancerResourcesQuery: queryMocks.useLoadBalancerResourcesQuery,
  };
});

const mockResourceHandler = vi.fn();
describe('ResourceMultiSelect component', () => {
  it('should render disabled component if the the props are undefined or regions and service type does not have any resources', () => {
    const { getByPlaceholderText, getByTestId } = renderWithTheme(
      <CloudViewMultiResourceSelect
        disabled={false}
        handleResourceChange={mockResourceHandler}
        region={undefined}
        resourceType={undefined}
      />
    );
    expect(getByTestId('Resource-select')).toBeInTheDocument();
    expect(getByPlaceholderText('Select a resource')).toBeInTheDocument();
  });

  it('should render resources from the aclb', () => {
    queryMocks.useLoadBalancerResourcesQuery.mockReturnValue({
      data: { data: loadbalancerFactory.buildList(2) },
      isError: false,
      isLoading: false,
      status: 'success',
    });
    renderWithTheme(
      <CloudViewMultiResourceSelect
        disabled={false}
        handleResourceChange={mockResourceHandler}
        region={'us-west'}
        resourceType={'aclb'}
      />
    );
    fireEvent.click(screen.getByRole('button', { name: 'Open' }));
    expect(
      screen.getByRole('option', {
        name: 'aclb-0',
      })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('option', {
        name: 'aclb-1',
      })
    ).toBeInTheDocument();
  });

  it('should be able to select all resources from aclb', () => {
    queryMocks.useLoadBalancerResourcesQuery.mockReturnValue({
      data: { data: loadbalancerFactory.buildList(2) },
      isError: false,
      isLoading: false,
      status: 'success',
    });
    renderWithTheme(
      <CloudViewMultiResourceSelect
        disabled={false}
        handleResourceChange={mockResourceHandler}
        region={'us-west'}
        resourceType={'aclb'}
      />
    );
    fireEvent.click(screen.getByRole('button', { name: 'Open' }));
    fireEvent.click(screen.getByRole('option', { name: 'Select All' }));
    expect(
      screen.getByRole('option', {
        name: 'aclb-2',
      })
    ).toHaveAttribute('aria-selected', 'true');
    expect(
      screen.getByRole('option', {
        name: 'aclb-3',
      })
    ).toHaveAttribute('aria-selected', 'true');
  });

  it('should be able to deselect the selected resources from aclb', () => {
    queryMocks.useLoadBalancerResourcesQuery.mockReturnValue({
      data: { data: loadbalancerFactory.buildList(2) },
      isError: false,
      isLoading: false,
      status: 'success',
    });
    renderWithTheme(
      <CloudViewMultiResourceSelect
        disabled={false}
        handleResourceChange={mockResourceHandler}
        region={'us-west'}
        resourceType={'aclb'}
      />
    );
    fireEvent.click(screen.getByRole('button', { name: 'Open' }));
    fireEvent.click(screen.getByRole('option', { name: 'Select All' }));
    fireEvent.click(screen.getByRole('option', { name: 'Deselect All' }));
    expect(
      screen.getByRole('option', {
        name: 'aclb-4',
      })
    ).toHaveAttribute('aria-selected', 'false');
    expect(
      screen.getByRole('option', {
        name: 'aclb-5',
      })
    ).toHaveAttribute('aria-selected', 'false');
  });

  it('should select multiple resources from aclb', () => {
    queryMocks.useLoadBalancerResourcesQuery.mockReturnValue({
      data: { data: loadbalancerFactory.buildList(3) },
      isError: false,
      isLoading: false,
      status: 'success',
    });
    renderWithTheme(
      <CloudViewMultiResourceSelect
        disabled={false}
        handleResourceChange={mockResourceHandler}
        region={'us-west'}
        resourceType={'aclb'}
      />
    );
    fireEvent.click(screen.getByRole('button', { name: 'Open' }));
    fireEvent.click(screen.getByRole('option', { name: 'aclb-6' }));
    fireEvent.click(screen.getByRole('option', { name: 'aclb-7' }));

    expect(
      screen.getByRole('option', {
        name: 'aclb-6',
      })
    ).toHaveAttribute('aria-selected', 'true');
    expect(
      screen.getByRole('option', {
        name: 'aclb-7',
      })
    ).toHaveAttribute('aria-selected', 'true');
    expect(
      screen.getByRole('option', {
        name: 'aclb-8',
      })
    ).toHaveAttribute('aria-selected', 'false');
    expect(
      screen.getByRole('option', {
        name: 'Select All',
      })
    ).toHaveAttribute('aria-selected', 'false');
  });

  it('should render resources from linodes', () => {
    queryMocks.useLinodeResourcesQuery.mockReturnValue({
      data: { data: linodeFactory.buildList(2) },
      isError: false,
      isLoading: false,
      status: 'success',
    });
    renderWithTheme(
      <CloudViewMultiResourceSelect
        disabled={false}
        handleResourceChange={mockResourceHandler}
        region={'us-east'}
        resourceType={'linode'}
      />
    );
    fireEvent.click(screen.getByRole('button', { name: 'Open' }));
    expect(
      screen.getByRole('option', {
        name: 'linode-0',
      })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('option', {
        name: 'linode-1',
      })
    ).toBeInTheDocument();
  });
  it('should be able to select all resources from linodes', () => {
    queryMocks.useLinodeResourcesQuery.mockReturnValue({
      data: { data: linodeFactory.buildList(2) },
      isError: false,
      isLoading: false,
      status: 'success',
    });
    renderWithTheme(
      <CloudViewMultiResourceSelect
        disabled={false}
        handleResourceChange={mockResourceHandler}
        region={'us-east'}
        resourceType={'linode'}
      />
    );
    fireEvent.click(screen.getByRole('button', { name: 'Open' }));
    fireEvent.click(screen.getByRole('option', { name: 'Select All' }));
    expect(
      screen.getByRole('option', {
        name: 'linode-2',
      })
    ).toHaveAttribute('aria-selected', 'true');
    expect(
      screen.getByRole('option', {
        name: 'linode-3',
      })
    ).toHaveAttribute('aria-selected', 'true');
  });

  it('should be able to deselect the selected resources from linodes', () => {
    queryMocks.useLinodeResourcesQuery.mockReturnValue({
      data: { data: linodeFactory.buildList(2) },
      isError: false,
      isLoading: false,
      status: 'success',
    });
    renderWithTheme(
      <CloudViewMultiResourceSelect
        disabled={false}
        handleResourceChange={mockResourceHandler}
        region={'us-east'}
        resourceType={'linode'}
      />
    );
    fireEvent.click(screen.getByRole('button', { name: 'Open' }));
    fireEvent.click(screen.getByRole('option', { name: 'Select All' }));
    fireEvent.click(screen.getByRole('option', { name: 'Deselect All' }));
    expect(
      screen.getByRole('option', {
        name: 'linode-4',
      })
    ).toHaveAttribute('aria-selected', 'false');
    expect(
      screen.getByRole('option', {
        name: 'linode-5',
      })
    ).toHaveAttribute('aria-selected', 'false');
  });

  it('should select multiple resources from linode', () => {
    queryMocks.useLinodeResourcesQuery.mockReturnValue({
      data: { data: linodeFactory.buildList(3) },
      isError: false,
      isLoading: false,
      status: 'success',
    });
    renderWithTheme(
      <CloudViewMultiResourceSelect
        disabled={false}
        handleResourceChange={mockResourceHandler}
        region={'us-east'}
        resourceType={'linode'}
      />
    );
    fireEvent.click(screen.getByRole('button', { name: 'Open' }));
    fireEvent.click(screen.getByRole('option', { name: 'linode-6' }));
    fireEvent.click(screen.getByRole('option', { name: 'linode-7' }));

    expect(
      screen.getByRole('option', {
        name: 'linode-6',
      })
    ).toHaveAttribute('aria-selected', 'true');
    expect(
      screen.getByRole('option', {
        name: 'linode-7',
      })
    ).toHaveAttribute('aria-selected', 'true');
    expect(
      screen.getByRole('option', {
        name: 'linode-8',
      })
    ).toHaveAttribute('aria-selected', 'false');
    expect(
      screen.getByRole('option', {
        name: 'Select All',
      })
    ).toHaveAttribute('aria-selected', 'false');

  });
});