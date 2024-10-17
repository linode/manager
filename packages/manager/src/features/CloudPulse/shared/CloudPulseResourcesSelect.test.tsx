import { fireEvent, screen } from '@testing-library/react';
import * as React from 'react';

import { linodeFactory } from 'src/factories';
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

describe('CloudPulseResourcesSelect component tests', () => {
  it('should render disabled component if the the props are undefined or regions and service type does not have any resources', () => {
    queryMocks.useResourcesQuery.mockReturnValue({
      data: linodeFactory.buildList(2),
      isError: false,
      isLoading: false,
      status: 'success',
    });
    const { getByPlaceholderText, getByTestId } = renderWithTheme(
      <CloudPulseResourcesSelect
        handleResourcesSelection={mockResourceHandler}
        label="Resources"
        region={undefined}
        resourceType={undefined}
      />
    );
    expect(getByTestId('resource-select')).toBeInTheDocument();
    expect(screen.getByLabelText('Resources')).toBeInTheDocument();
    expect(getByPlaceholderText('Select Resources')).toBeInTheDocument();
  }),
    it('should render resources happy path', () => {
      queryMocks.useResourcesQuery.mockReturnValue({
        data: linodeFactory.buildList(2),
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
      fireEvent.click(screen.getByRole('button', { name: 'Open' }));
      expect(screen.getByLabelText('Resources')).toBeInTheDocument();
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
    renderWithTheme(
      <CloudPulseResourcesSelect
        handleResourcesSelection={mockResourceHandler}
        label="Resources"
        region={'us-east'}
        resourceType={'linode'}
      />
    );
    fireEvent.click(screen.getByRole('button', { name: 'Open' }));
    fireEvent.click(screen.getByRole('option', { name: SELECT_ALL }));
    expect(screen.getByLabelText('Resources')).toBeInTheDocument();
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
    renderWithTheme(
      <CloudPulseResourcesSelect
        handleResourcesSelection={mockResourceHandler}
        label="Resources"
        region={'us-east'}
        resourceType={'linode'}
      />
    );
    fireEvent.click(screen.getByRole('button', { name: 'Open' }));
    fireEvent.click(screen.getByRole('option', { name: SELECT_ALL }));
    fireEvent.click(screen.getByRole('option', { name: 'Deselect All' }));
    expect(screen.getByLabelText('Resources')).toBeInTheDocument();
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
    renderWithTheme(
      <CloudPulseResourcesSelect
        handleResourcesSelection={mockResourceHandler}
        label="Resources"
        region={'us-east'}
        resourceType={'linode'}
      />
    );
    fireEvent.click(screen.getByRole('button', { name: 'Open' }));
    fireEvent.click(screen.getByRole('option', { name: 'linode-9' }));
    fireEvent.click(screen.getByRole('option', { name: 'linode-10' }));
    expect(screen.getByLabelText('Resources')).toBeInTheDocument();

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
  it('Should select the default resource returned from preferences', () => {
    queryMocks.useResourcesQuery.mockReturnValue({
      data: linodeFactory.buildList(2),
      isError: false,
      isLoading: false,
      status: 'success',
    });

    renderWithTheme(
      <CloudPulseResourcesSelect
        defaultValue={['12']}
        handleResourcesSelection={mockResourceHandler}
        label="Resources"
        region={'us-east'}
        resourceType={'linode'}
        savePreferences
      />
    );

    expect(
      screen.getByRole('button', {
        name: 'linode-12',
      })
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Open' }));

    expect(
      screen.getByRole('option', {
        name: 'linode-13',
      })
    ).toHaveAttribute(ARIA_SELECTED, 'false');
  });
});
