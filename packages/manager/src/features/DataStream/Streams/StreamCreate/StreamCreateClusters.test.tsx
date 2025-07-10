import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { describe, expect, it } from 'vitest';

import { renderWithThemeAndHookFormContext } from 'src/utilities/testHelpers';

import { StreamCreateClusters } from './StreamCreateClusters';

const renderComponentWithoutSelectedClusters = () => {
  renderWithThemeAndHookFormContext({
    component: <StreamCreateClusters />,
    useFormOptions: {
      defaultValues: {
        details: {
          cluster_ids: [],
          is_auto_add_all_clusters_enabled: false,
        },
      },
    },
  });
};

const getColumnsValuesFromTable = (column = 1) => {
  return screen
    .getAllByRole('row')
    .slice(1)
    .map((row) => {
      const cells = within(row).getAllByRole('cell');
      return cells[column]?.textContent?.trim();
    });
};

describe('StreamCreateClusters', () => {
  it('should render all clusters in table', async () => {
    renderComponentWithoutSelectedClusters();

    expect(getColumnsValuesFromTable()).toEqual([
      'gke-prod-europe-west1',
      'metrics-stream-cluster',
      'prod-cluster-eu',
    ]);
  });

  it('should filter clusters by name', async () => {
    renderComponentWithoutSelectedClusters();
    const input = screen.getByPlaceholderText('Search');

    // Type test value inside the search
    await userEvent.click(input);
    await userEvent.type(input, 'metrics');

    await waitFor(() =>
      expect(getColumnsValuesFromTable()).toEqual(['metrics-stream-cluster'])
    );
  });

  it('should filter clusters by region', async () => {
    renderComponentWithoutSelectedClusters();
    const input = screen.getByPlaceholderText('Search');

    // Type test value inside the search
    await userEvent.click(input);
    await userEvent.type(input, 'US,');

    await waitFor(() =>
      expect(getColumnsValuesFromTable(2)).toEqual([
        'US, Atalanta, GA',
        'US, Chicago, IL',
      ])
    );
  });

  it('should filter clusters by log generation status', async () => {
    renderComponentWithoutSelectedClusters();
    const input = screen.getByPlaceholderText('Search');

    // Type test value inside the search
    await userEvent.click(input);
    await userEvent.type(input, 'enabled');

    await waitFor(() =>
      expect(getColumnsValuesFromTable(3)).toEqual(['Enabled', 'Enabled'])
    );
  });

  it('should toggle clusters checkboxes and header checkbox', async () => {
    renderComponentWithoutSelectedClusters();
    const table = screen.getByRole('table');
    const checkboxes = within(table).getAllByRole('checkbox');
    const headerCheckbox = checkboxes[0];

    const expectHeaderCheckboxToBe = (
      state: 'checked' | 'indeterminate' | 'unchecked'
    ) => {
      if (state === 'checked') {
        expect(headerCheckbox).toBeChecked();
      } else if (state === 'unchecked') {
        expect(headerCheckbox).not.toBeChecked();
      } else {
        expect(headerCheckbox.getAttribute('data-indeterminate')).toEqual(
          'true'
        );
      }
    };

    // Select and unselect checkboxes
    expect(checkboxes[1]).toBeDisabled();
    expect(checkboxes[2]).not.toBeChecked();
    expectHeaderCheckboxToBe('unchecked');
    await userEvent.click(checkboxes[2]);
    expect(checkboxes[2]).toBeChecked();
    expectHeaderCheckboxToBe('indeterminate');
    await userEvent.click(checkboxes[2]);
    expectHeaderCheckboxToBe('unchecked');
    await userEvent.click(checkboxes[2]);
    await userEvent.click(checkboxes[3]);
    expect(checkboxes[2]).toBeChecked();
    expect(checkboxes[3]).toBeChecked();
    expectHeaderCheckboxToBe('checked');
  });

  it('should select and deselect all clusters with header checkbox', async () => {
    renderComponentWithoutSelectedClusters();
    const table = screen.getByRole('table');
    const checkboxes = within(table).getAllByRole('checkbox');
    const headerCheckbox = checkboxes[0];

    expect(headerCheckbox).not.toBeChecked();

    // Select header checkbox
    await userEvent.click(headerCheckbox);
    expect(headerCheckbox).toBeChecked();
    expect(checkboxes[1]).toBeDisabled();
    expect(checkboxes[2]).toBeChecked();
    expect(checkboxes[3]).toBeChecked();

    // Unselect header checkbox
    await userEvent.click(headerCheckbox);
    expect(headerCheckbox).not.toBeChecked();
    expect(checkboxes[1]).toBeDisabled();
    expect(checkboxes[2]).not.toBeChecked();
    expect(checkboxes[3]).not.toBeChecked();
  });

  describe('when form has already selected clusters', () => {
    it('should render table with properly selected clusters', async () => {
      renderWithThemeAndHookFormContext({
        component: <StreamCreateClusters />,
        useFormOptions: {
          defaultValues: {
            details: {
              cluster_ids: [3],
            },
          },
        },
      });
      const table = screen.getByRole('table');
      const checkboxes = within(table).getAllByRole('checkbox');

      expect(checkboxes[0].getAttribute('data-indeterminate')).toEqual('true');
      expect(checkboxes[1]).not.toBeChecked();
      expect(checkboxes[3]).not.toBeChecked();
      expect(checkboxes[2]).toBeChecked();
    });
  });

  it('should disable all table checkboxes if "Automatically include all..." checkbox is selected', async () => {
    renderComponentWithoutSelectedClusters();
    const table = screen.getByRole('table');
    const tableCheckboxes = within(table).getAllByRole('checkbox');
    const autoIncludeAllCheckbox = screen.getByText(
      'Automatically include all existing and recently configured clusters.'
    );

    expect(tableCheckboxes[0]).not.toBeDisabled();
    expect(tableCheckboxes[1]).toBeDisabled();
    expect(tableCheckboxes[2]).not.toBeDisabled();

    await userEvent.click(autoIncludeAllCheckbox);
    tableCheckboxes.forEach((checkbox) => {
      expect(checkbox).toBeDisabled();
    });
  });

  it('should select and deselect all clusters with "Automatically include all..." checkbox', async () => {
    renderComponentWithoutSelectedClusters();
    const checkboxes = screen.getAllByRole('checkbox');
    const [autoIncludeAllCheckbox, headerTableCheckbox] = checkboxes;

    expect(autoIncludeAllCheckbox).not.toBeChecked();

    // Select "Automatically include all..." checkbox
    await userEvent.click(autoIncludeAllCheckbox);
    expect(autoIncludeAllCheckbox).toBeChecked();
    expect(headerTableCheckbox).toBeChecked();
    expect(checkboxes[2]).toBeDisabled();
    expect(checkboxes[3]).toBeChecked();
    expect(checkboxes[4]).toBeChecked();

    // Unselect "Automatically include all..." checkbox
    await userEvent.click(autoIncludeAllCheckbox);
    expect(autoIncludeAllCheckbox).not.toBeChecked();
    expect(headerTableCheckbox).not.toBeChecked();
    expect(checkboxes[2]).toBeDisabled();
    expect(checkboxes[3]).not.toBeChecked();
    expect(checkboxes[4]).not.toBeChecked();
  });

  it('should sort clusters by Cluster Name if clicked', async () => {
    renderComponentWithoutSelectedClusters();
    const sortHeader = screen.getByRole('columnheader', {
      name: 'Cluster Name',
    });

    expect(getColumnsValuesFromTable()).toEqual([
      'gke-prod-europe-west1',
      'metrics-stream-cluster',
      'prod-cluster-eu',
    ]);

    // Sort by Cluster Name descending
    await userEvent.click(sortHeader);
    expect(getColumnsValuesFromTable()).toEqual([
      'prod-cluster-eu',
      'metrics-stream-cluster',
      'gke-prod-europe-west1',
    ]);
  });

  it('should sort clusters by Region if clicked', async () => {
    renderComponentWithoutSelectedClusters();
    const sortHeader = screen.getByRole('columnheader', {
      name: 'Region',
    });

    // Sort by Region ascending
    await userEvent.click(sortHeader);
    expect(getColumnsValuesFromTable(2)).toEqual([
      'NL, Amsterdam',
      'US, Atalanta, GA',
      'US, Chicago, IL',
    ]);

    // Sort by Region descending
    await userEvent.click(sortHeader);
    expect(getColumnsValuesFromTable(2)).toEqual([
      'US, Chicago, IL',
      'US, Atalanta, GA',
      'NL, Amsterdam',
    ]);
  });

  it('should sort clusters by Log Generation if clicked', async () => {
    renderComponentWithoutSelectedClusters();
    const sortHeader = screen.getByRole('columnheader', {
      name: 'Log Generation',
    });

    // Sort by Log Generation ascending
    await userEvent.click(sortHeader);
    expect(getColumnsValuesFromTable(3)).toEqual([
      'Enabled',
      'Enabled',
      'Disabled',
    ]);

    // Sort by Log Generation descending
    await userEvent.click(sortHeader);
    expect(getColumnsValuesFromTable(3)).toEqual([
      'Disabled',
      'Enabled',
      'Enabled',
    ]);
  });

  it('should keep checkboxes selection after sorting', async () => {
    renderComponentWithoutSelectedClusters();
    const checkboxes = screen.getAllByRole('checkbox');

    const sortHeader = screen.getByRole('columnheader', {
      name: 'Log Generation',
    });

    // Select "prod-cluster-eu" cluster
    await userEvent.click(checkboxes[4]);
    expect(checkboxes[2]).not.toBeChecked();
    expect(checkboxes[3]).not.toBeChecked();
    expect(checkboxes[4]).toBeChecked();

    // Sort by Log Generation ascending
    await userEvent.click(sortHeader);
    const checkboxesAfterSort = screen.getAllByRole('checkbox');

    // After sorting the "prod-cluster-eu" checkbox is first in table
    expect(checkboxesAfterSort[2]).toBeChecked();
    expect(checkboxesAfterSort[3]).not.toBeChecked();
    expect(checkboxesAfterSort[4]).not.toBeChecked();
  });
});
