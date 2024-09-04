import { fireEvent, screen } from '@testing-library/react';
import * as React from 'react';

import { linodeFactory } from 'src/factories';
import { renderWithThemeAndFormik } from 'src/utilities/testHelpers';

import { initialValues } from '../CreateAlertDefinition';
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

const handleOnSubmit = vi.fn();
const SELECT_ALL = 'Select All';
const ARIA_SELECTED = 'aria-selected';
describe('ResourceMultiSelect component tests', () => {
  it('should render disabled component if the props are undefined or regions and service type does not have any values', () => {
    queryMocks.useResourcesQuery.mockReturnValue({
      data: linodeFactory.buildList(2),
      isError: false,
      isLoading: false,
      status: 'success',
    });
    const { getByPlaceholderText, getByTestId } = renderWithThemeAndFormik(
      <CloudPulseMultiResourceSelect
        cluster={false}
        name={'resource_ids'}
        region={undefined}
        serviceType={undefined}
      />,
      {
        initialValues,
        onSubmit: handleOnSubmit,
      }
    );
    expect(getByTestId('resource-select')).toBeInTheDocument();
    expect(getByPlaceholderText('Select Resources')).toBeInTheDocument();
  });
  it('should render resources happy path', () => {
    queryMocks.useResourcesQuery.mockReturnValue({
      data: linodeFactory.buildList(2),
      isError: false,
      isLoading: false,
      status: 'success',
    });
    renderWithThemeAndFormik(
      <CloudPulseMultiResourceSelect
        cluster={false}
        name={'resource_ids'}
        region={'us-east'}
        serviceType={'linode'}
      />,
      {
        initialValues,
        onSubmit: handleOnSubmit,
      }
    );
    fireEvent.click(screen.getByRole('button', { name: 'Open' }));
    expect(
      screen.getByRole('option', {
        name: 'linode-3',
      })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('option', {
        name: 'linode-4',
      })
    ).toBeInTheDocument();
  });
  it('should be able to select all resources', () => {
    queryMocks.useResourcesQuery.mockReturnValue({
      data: linodeFactory.buildList(2),
      isError: false,
      isLoading: false,
      status: 'success',
    });
    renderWithThemeAndFormik(
      <CloudPulseMultiResourceSelect
        cluster={false}
        name={'resource_ids'}
        region={'us-east'}
        serviceType={'linode'}
      />,
      {
        initialValues,
        onSubmit: handleOnSubmit,
      }
    );
    fireEvent.click(screen.getByRole('button', { name: 'Open' }));
    fireEvent.click(screen.getByRole('option', { name: SELECT_ALL }));
    expect(
      screen.getByRole('option', {
        name: 'linode-5',
      })
    ).toHaveAttribute(ARIA_SELECTED, 'true');
    expect(
      screen.getByRole('option', {
        name: 'linode-6',
      })
    ).toHaveAttribute(ARIA_SELECTED, 'true');
  });
  it('should be able to deselect the selected resources', () => {
    queryMocks.useResourcesQuery.mockReturnValue({
      data: linodeFactory.buildList(2),
      isError: false,
      isLoading: false,
      status: 'success',
    });
    renderWithThemeAndFormik(
      <CloudPulseMultiResourceSelect
        cluster={false}
        name={'resource_ids'}
        region={'us-east'}
        serviceType={'linode'}
      />,
      {
        initialValues,
        onSubmit: handleOnSubmit,
      }
    );
    fireEvent.click(screen.getByRole('button', { name: 'Open' }));
    fireEvent.click(screen.getByRole('option', { name: SELECT_ALL }));
    fireEvent.click(screen.getByRole('option', { name: 'Deselect All' }));
    expect(
      screen.getByRole('option', {
        name: 'linode-7',
      })
    ).toHaveAttribute(ARIA_SELECTED, 'false');
    expect(
      screen.getByRole('option', {
        name: 'linode-8',
      })
    ).toHaveAttribute(ARIA_SELECTED, 'false');
  });

  it('should select multiple resources', () => {
    queryMocks.useResourcesQuery.mockReturnValue({
      data: linodeFactory.buildList(3),
      isError: false,
      isLoading: false,
      status: 'success',
    });
    renderWithThemeAndFormik(
      <CloudPulseMultiResourceSelect
        cluster={false}
        name={'resource_ids'}
        region={'us-east'}
        serviceType={'linode'}
      />,
      {
        initialValues,
        onSubmit: handleOnSubmit,
      }
    );
    fireEvent.click(screen.getByRole('button', { name: 'Open' }));
    fireEvent.click(screen.getByRole('option', { name: 'linode-9' }));
    fireEvent.click(screen.getByRole('option', { name: 'linode-10' }));

    expect(
      screen.getByRole('option', {
        name: 'linode-9',
      })
    ).toHaveAttribute(ARIA_SELECTED, 'true');
    expect(
      screen.getByRole('option', {
        name: 'linode-10',
      })
    ).toHaveAttribute(ARIA_SELECTED, 'true');
    expect(
      screen.getByRole('option', {
        name: 'linode-11',
      })
    ).toHaveAttribute(ARIA_SELECTED, 'false');
    expect(
      screen.getByRole('option', {
        name: 'Select All',
      })
    ).toHaveAttribute(ARIA_SELECTED, 'false');
  });
  it('should render the label as cluster when resource is of dbaas type', () => {
    const { getByLabelText } = renderWithThemeAndFormik(
      <CloudPulseMultiResourceSelect
        cluster={true}
        name={'resource_ids'}
        region={'us-east'}
        serviceType={'dbaas'}
      />,
      {
        initialValues,
        onSubmit: handleOnSubmit,
      }
    );
    expect(getByLabelText('Cluster'));
  });
});
