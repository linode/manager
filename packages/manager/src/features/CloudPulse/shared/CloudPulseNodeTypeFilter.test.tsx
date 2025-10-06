import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';

import { databaseInstanceFactory } from 'src/factories';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { CloudPulseNodeTypeFilter } from './CloudPulseNodeTypeFilter';

import type { CloudPulseNodeTypeFilterProps } from './CloudPulseNodeTypeFilter';

const props: CloudPulseNodeTypeFilterProps = {
  database_ids: [1, 2],
  defaultValue: undefined,
  disabled: false,
  handleNodeTypeChange: vi.fn(),
  label: 'Node Type',
  placeholder: 'Select a Node Type',
  savePreferences: true,
};

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

describe('CloudPulseNodeTypeFilter', () => {
  it('renders the component with correct props', () => {
    const { getByLabelText, getByPlaceholderText } = renderWithTheme(
      <CloudPulseNodeTypeFilter {...props} />
    );
    expect(getByLabelText('Node Type')).toBeInTheDocument();
    expect(getByPlaceholderText('Select a Node Type')).toBeInTheDocument();
  });

  it('handles disabled state correctly', () => {
    const { getByLabelText } = renderWithTheme(
      <CloudPulseNodeTypeFilter {...props} disabled={true} />
    );

    const select = getByLabelText('Node Type');
    expect(select).toBeDisabled();
  });

  it('initializes with Primary as default value when no preferences are saved', async () => {
    queryMocks.useResourcesQuery.mockReturnValue({
      data: [{ ...databaseInstanceFactory.build(), clusterSize: 1 }],
      isError: false,
      isLoading: false,
    });
    const { getByLabelText, getByText } = renderWithTheme(
      <CloudPulseNodeTypeFilter
        {...props}
        defaultValue={undefined}
        savePreferences={false}
      />
    );
    await userEvent.click(getByLabelText('Node Type'));
    expect(getByText('Primary')).toBeInTheDocument();
  });

  it('displays correct options in dropdown in case of maximum cluster size one', async () => {
    queryMocks.useResourcesQuery.mockReturnValue({
      data: [
        {
          ...databaseInstanceFactory.build({ id: 1 }),
          clusterSize: 1,
        },
        {
          ...databaseInstanceFactory.build({ id: 2 }),
          clusterSize: 1,
        },
      ],
      isError: false,
      isLoading: false,
    });

    const { getByLabelText } = renderWithTheme(
      <CloudPulseNodeTypeFilter {...props} />
    );

    await userEvent.click(getByLabelText('Node Type'));

    expect(screen.getByText('Primary')).toBeInTheDocument();
    expect(screen.queryByText('Secondary')).not.toBeInTheDocument();
  });

  it('displays correct options in dropdown if maximum cluster size is greater than one', async () => {
    queryMocks.useResourcesQuery.mockReturnValue({
      data: [
        {
          ...databaseInstanceFactory.build({ id: 1 }),
          clusterSize: 2,
        },
        {
          ...databaseInstanceFactory.build({ id: 2 }),
          clusterSize: 3,
        },
      ],
      isError: false,
      isLoading: false,
    });

    const { getByLabelText, getByText } = renderWithTheme(
      <CloudPulseNodeTypeFilter {...props} />
    );

    await userEvent.click(getByLabelText('Node Type'));

    expect(getByText('Primary')).toBeInTheDocument();
    expect(getByText('Secondary')).toBeInTheDocument();
  });

  it('handles empty database_ids', () => {
    const { queryByText } = renderWithTheme(
      <CloudPulseNodeTypeFilter {...props} database_ids={[]} />
    );

    expect(queryByText('Primary')).not.toBeInTheDocument();
    expect(queryByText('Secondary')).not.toBeInTheDocument();
  });

  it('maintains selected value in preferences after re-render', async () => {
    queryMocks.useResourcesQuery.mockReturnValue({
      data: [
        {
          ...databaseInstanceFactory.build({ id: 1 }),
          clusterSize: 1,
        },
        {
          ...databaseInstanceFactory.build({ id: 2 }),
          clusterSize: 3,
        },
      ],
      isError: false,
      isLoading: false,
    });

    const { getByRole } = renderWithTheme(
      <CloudPulseNodeTypeFilter {...props} defaultValue="secondary" />
    );
    const combobox = getByRole('combobox', { name: 'Node Type' });
    expect(combobox).toBeInTheDocument();
    expect(combobox).toHaveValue('Secondary');
  });
});
