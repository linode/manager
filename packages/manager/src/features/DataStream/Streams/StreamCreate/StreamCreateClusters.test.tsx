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
        stream: {
          details: {},
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

const getCheckboxByClusterName = (clusterName: string) => {
  return within(
    screen.getByLabelText(`Toggle ${clusterName} cluster`)
  ).getByRole('checkbox');
};

const expectCheckboxStateToBe = (
  checkbox: HTMLElement,
  state: 'checked' | 'indeterminate' | 'unchecked'
) => {
  if (state === 'checked') {
    expect(checkbox).toBeChecked();
  } else if (state === 'unchecked') {
    expect(checkbox).not.toBeChecked();
  } else {
    expect(checkbox.getAttribute('data-indeterminate')).toEqual('true');
  }
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
    const headerCheckbox = within(table).getAllByRole('checkbox')[0];
    const gkeProdCheckbox = getCheckboxByClusterName('gke-prod-europe-west1');
    const metricsStreamCheckbox = getCheckboxByClusterName(
      'metrics-stream-cluster'
    );
    const prodClusterCheckbox = getCheckboxByClusterName('prod-cluster-eu');

    // Select and unselect checkboxes
    // console.log(getColumnsValuesFromTable());
    expect(gkeProdCheckbox).toBeDisabled();
    expect(metricsStreamCheckbox).not.toBeChecked();
    expectCheckboxStateToBe(headerCheckbox, 'unchecked');
    await userEvent.click(metricsStreamCheckbox);
    expect(metricsStreamCheckbox).toBeChecked();
    expectCheckboxStateToBe(headerCheckbox, 'indeterminate');
    await userEvent.click(metricsStreamCheckbox);
    expectCheckboxStateToBe(headerCheckbox, 'unchecked');
    await userEvent.click(metricsStreamCheckbox);
    await userEvent.click(prodClusterCheckbox);
    expect(metricsStreamCheckbox).toBeChecked();
    expect(prodClusterCheckbox).toBeChecked();
    expectCheckboxStateToBe(headerCheckbox, 'checked');
  });

  it('should select and deselect all clusters with header checkbox', async () => {
    renderComponentWithoutSelectedClusters();
    const table = screen.getByRole('table');
    const headerCheckbox = within(table).getAllByRole('checkbox')[0];
    const gkeProdCheckbox = getCheckboxByClusterName('gke-prod-europe-west1');
    const metricsStreamCheckbox = getCheckboxByClusterName(
      'metrics-stream-cluster'
    );
    const prodClusterCheckbox = getCheckboxByClusterName('prod-cluster-eu');

    expect(headerCheckbox).not.toBeChecked();

    // Select header checkbox
    await userEvent.click(headerCheckbox);
    expect(headerCheckbox).toBeChecked();
    expect(gkeProdCheckbox).toBeDisabled();
    expect(metricsStreamCheckbox).toBeChecked();
    expect(prodClusterCheckbox).toBeChecked();

    // Unselect header checkbox
    await userEvent.click(headerCheckbox);
    expect(headerCheckbox).not.toBeChecked();
    expect(gkeProdCheckbox).toBeDisabled();
    expect(metricsStreamCheckbox).not.toBeChecked();
    expect(prodClusterCheckbox).not.toBeChecked();
  });

  describe('when form has already selected clusters', () => {
    it('should render table with properly selected clusters', async () => {
      renderWithThemeAndHookFormContext({
        component: <StreamCreateClusters />,
        useFormOptions: {
          defaultValues: {
            stream: {
              details: {
                cluster_ids: [3],
              },
            },
          },
        },
      });
      const table = screen.getByRole('table');
      const headerCheckbox = within(table).getAllByRole('checkbox')[0];
      const gkeProdCheckbox = getCheckboxByClusterName('gke-prod-europe-west1');
      const metricsStreamCheckbox = getCheckboxByClusterName(
        'metrics-stream-cluster'
      );
      const prodClusterCheckbox = getCheckboxByClusterName('prod-cluster-eu');

      expectCheckboxStateToBe(headerCheckbox, 'indeterminate');
      expect(gkeProdCheckbox).not.toBeChecked();
      expect(metricsStreamCheckbox).toBeChecked();
      expect(prodClusterCheckbox).not.toBeChecked();
    });
  });

  it('should disable all table checkboxes if "Automatically include all..." checkbox is selected', async () => {
    renderComponentWithoutSelectedClusters();
    const table = screen.getByRole('table');
    const autoIncludeAllCheckbox = screen.getByText(
      'Automatically include all existing and recently configured clusters.'
    );
    const headerCheckbox = within(table).getAllByRole('checkbox')[0];
    const gkeProdCheckbox = getCheckboxByClusterName('gke-prod-europe-west1');
    const metricsStreamCheckbox = getCheckboxByClusterName(
      'metrics-stream-cluster'
    );
    const prodClusterCheckbox = getCheckboxByClusterName('prod-cluster-eu');

    expect(headerCheckbox).not.toBeDisabled();
    expect(gkeProdCheckbox).toBeDisabled();
    expect(metricsStreamCheckbox).not.toBeDisabled();
    expect(prodClusterCheckbox).not.toBeDisabled();

    await userEvent.click(autoIncludeAllCheckbox);
    expect(headerCheckbox).toBeDisabled();
    expect(gkeProdCheckbox).toBeDisabled();
    expect(metricsStreamCheckbox).toBeDisabled();
    expect(prodClusterCheckbox).toBeDisabled();
  });

  it('should select and deselect all clusters with "Automatically include all..." checkbox', async () => {
    renderComponentWithoutSelectedClusters();
    const checkboxes = screen.getAllByRole('checkbox');
    const [autoIncludeAllCheckbox, headerTableCheckbox] = checkboxes;
    const gkeProdCheckbox = getCheckboxByClusterName('gke-prod-europe-west1');
    const metricsStreamCheckbox = getCheckboxByClusterName(
      'metrics-stream-cluster'
    );
    const prodClusterCheckbox = getCheckboxByClusterName('prod-cluster-eu');

    expect(autoIncludeAllCheckbox).not.toBeChecked();

    // Select "Automatically include all..." checkbox
    await userEvent.click(autoIncludeAllCheckbox);
    expect(autoIncludeAllCheckbox).toBeChecked();
    expect(headerTableCheckbox).toBeChecked();
    expect(gkeProdCheckbox).toBeDisabled();
    expect(metricsStreamCheckbox).toBeChecked();
    expect(prodClusterCheckbox).toBeChecked();

    // Unselect "Automatically include all..." checkbox
    await userEvent.click(autoIncludeAllCheckbox);
    expect(autoIncludeAllCheckbox).not.toBeChecked();
    expect(headerTableCheckbox).not.toBeChecked();
    expect(gkeProdCheckbox).toBeDisabled();
    expect(metricsStreamCheckbox).not.toBeChecked();
    expect(prodClusterCheckbox).not.toBeChecked();
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
    const gkeProdCheckbox = getCheckboxByClusterName('gke-prod-europe-west1');
    const metricsStreamCheckbox = getCheckboxByClusterName(
      'metrics-stream-cluster'
    );
    const prodClusterCheckbox = getCheckboxByClusterName('prod-cluster-eu');

    const sortHeader = screen.getByRole('columnheader', {
      name: 'Log Generation',
    });

    // Select "prod-cluster-eu" cluster
    await userEvent.click(prodClusterCheckbox);
    expect(gkeProdCheckbox).not.toBeChecked();
    expect(metricsStreamCheckbox).not.toBeChecked();
    expect(prodClusterCheckbox).toBeChecked();

    // Sort by Log Generation ascending
    await userEvent.click(sortHeader);
    expect(gkeProdCheckbox).not.toBeChecked();
    expect(metricsStreamCheckbox).not.toBeChecked();
    expect(prodClusterCheckbox).toBeChecked();
  });
});
