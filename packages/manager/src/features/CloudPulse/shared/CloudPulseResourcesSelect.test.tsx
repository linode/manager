import { linodeFactory } from '@linode/utilities';
import { fireEvent, screen } from '@testing-library/react';
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
  it('should be able to select all resources if resource selection limit is higher than number of resources', () => {
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

  it('Should show appropriate error message on resources call failure', async () => {
    queryMocks.useResourcesQuery.mockReturnValue({
      data: undefined,
      isError: true,
      isLoading: false,
      status: 'error',
    });
    renderWithTheme(
      <CloudPulseResourcesSelect
        defaultValue={['12']}
        handleResourcesSelection={mockResourceHandler}
        label="Resource"
        region={'us-east'}
        resourceType={'linode'}
        savePreferences
      />
    );
    expect(screen.getByText('Failed to fetch Resource.')).toBeInTheDocument();

    // if the label is ABC, error message should be Failed to fetch ABC
    renderWithTheme(
      <CloudPulseResourcesSelect
        defaultValue={['12']}
        handleResourcesSelection={mockResourceHandler}
        label="ABC"
        region={'us-east'}
        resourceType={'linode'}
        savePreferences
      />
    );
    expect(screen.getByText('Failed to fetch ABC.')).toBeInTheDocument();

    // if the label is empty , error message should be Failed to fetch Resources
    renderWithTheme(
      <CloudPulseResourcesSelect
        defaultValue={['12']}
        handleResourcesSelection={mockResourceHandler}
        label=""
        region={'us-east'}
        resourceType={'linode'}
        savePreferences
      />
    );
    expect(screen.getByText('Failed to fetch Resources.')).toBeInTheDocument();
  });

  it('should be able to select limited resources and select/deselect all will not be available if resource are more than max resource selection limit', async () => {
    const user = userEvent.setup();

    queryMocks.useResourcesQuery.mockReturnValue({
      data: linodeFactory.buildList(12),
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

    expect(screen.getByLabelText('Resources')).toBeInTheDocument();
    expect(screen.getByText('Select up to 10 Resources')).toBeInTheDocument();

    for (let i = 14; i <= 23; i++) {
      // eslint-disable-next-line no-await-in-loop
      const option = await screen.findByRole('option', { name: `linode-${i}` });
      // eslint-disable-next-line no-await-in-loop
      await user.click(option);
    }

    const selectedOptions = screen
      .getAllByRole('option')
      .filter((option) => option.getAttribute(ARIA_SELECTED) === 'true');

    expect(selectedOptions.length).toBe(10);

    const isResourceWithExceededLimit = await screen.findByRole('option', {
      name: 'linode-24',
    });
    expect(isResourceWithExceededLimit).toHaveAttribute(ARIA_DISABLED, 'true');

    expect(queryByRole('option', { name: SELECT_ALL })).not.toBeInTheDocument();
  });

  it('should be able to select all and deselect all the resources when number of resources are equal to resource limit', async () => {
    const user = userEvent.setup();

    queryMocks.useResourcesQuery.mockReturnValue({
      data: linodeFactory.buildList(10),
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

    expect(screen.getByLabelText('Resources')).toBeInTheDocument();

    for (let i = 26; i <= 35; i++) {
      expect(
        screen.getByRole('option', { name: `linode-${i}` })
      ).toHaveAttribute(ARIA_SELECTED, 'false');
    }
  });
});
