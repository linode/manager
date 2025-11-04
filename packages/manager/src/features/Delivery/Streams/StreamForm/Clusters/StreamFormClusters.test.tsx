import {
  screen,
  waitForElementToBeRemoved,
  within,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { describe, expect, it } from 'vitest';

import { kubernetesClusterFactory } from 'src/factories';
import { makeResourcePage } from 'src/mocks/serverHandlers';
import { http, HttpResponse, server } from 'src/mocks/testServer';
import { renderWithThemeAndHookFormContext } from 'src/utilities/testHelpers';

import { StreamFormClusters } from './StreamFormClusters';

const queryMocks = vi.hoisted(() => ({
  useOrderV2: vi.fn().mockReturnValue({}),
}));

const loadingTestId = 'circle-progress';
const testClustersDetails = [
  {
    label: 'gke-prod-europe-west1',
    id: 1,
    region: 'US, Atalanta, GA',
    control_plane: {
      audit_logs_enabled: false,
    },
  },
  {
    label: 'metrics-stream-cluster',
    id: 2,
    region: 'US, Chicago, IL',
    control_plane: {
      audit_logs_enabled: true,
    },
  },
  {
    label: 'prod-cluster-eu',
    id: 3,
    region: 'NL, Amsterdam',
    control_plane: {
      audit_logs_enabled: true,
    },
  },
];
const clusters = kubernetesClusterFactory.buildList(3).map((cluster, idx) => ({
  ...cluster,
  ...testClustersDetails[idx],
}));

const renderComponentWithoutSelectedClusters = async () => {
  server.use(
    http.get('*/lke/clusters', () => {
      return HttpResponse.json(makeResourcePage(clusters));
    })
  );

  const utils = renderWithThemeAndHookFormContext({
    component: <StreamFormClusters mode="edit" />,
    useFormOptions: {
      defaultValues: {
        stream: {
          details: {
            cluster_ids: [],
            is_auto_add_all_clusters_enabled: false,
          },
        },
      },
    },
  });

  const loadingElement = utils.queryByTestId(loadingTestId);
  expect(loadingElement).toBeInTheDocument();
  await waitForElementToBeRemoved(loadingElement);

  return utils;
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

describe('StreamFormClusters', () => {
  it('should render all clusters in table', async () => {
    await renderComponentWithoutSelectedClusters();

    expect(getColumnsValuesFromTable()).toEqual([
      'gke-prod-europe-west1',
      'metrics-stream-cluster',
      'prod-cluster-eu',
    ]);
  });

  it('should toggle clusters checkboxes and header checkbox', async () => {
    await renderComponentWithoutSelectedClusters();
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
    await renderComponentWithoutSelectedClusters();
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
      server.use(
        http.get('*/lke/clusters', () => {
          return HttpResponse.json(makeResourcePage(clusters));
        })
      );

      renderWithThemeAndHookFormContext({
        component: <StreamFormClusters mode="edit" />,
        useFormOptions: {
          defaultValues: {
            stream: {
              details: {
                cluster_ids: [2],
                is_auto_add_all_clusters_enabled: false,
              },
            },
          },
        },
      });

      const loadingElement = screen.queryByTestId(loadingTestId);
      expect(loadingElement).toBeInTheDocument();
      await waitForElementToBeRemoved(loadingElement);

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

  it('should disable all table checkboxes if "Automatically include all" checkbox is selected', async () => {
    await renderComponentWithoutSelectedClusters();
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

  it('should select and deselect all clusters with "Automatically include all" checkbox', async () => {
    await renderComponentWithoutSelectedClusters();
    const checkboxes = screen.getAllByRole('checkbox');
    const [autoIncludeAllCheckbox, headerTableCheckbox] = checkboxes;
    const gkeProdCheckbox = getCheckboxByClusterName('gke-prod-europe-west1');
    const metricsStreamCheckbox = getCheckboxByClusterName(
      'metrics-stream-cluster'
    );
    const prodClusterCheckbox = getCheckboxByClusterName('prod-cluster-eu');

    expect(autoIncludeAllCheckbox).not.toBeChecked();

    // Select "Automatically include all" checkbox
    await userEvent.click(autoIncludeAllCheckbox);
    expect(autoIncludeAllCheckbox).toBeChecked();
    // expect(headerTableCheckbox).toBeChecked(); // hidden for beta
    expect(gkeProdCheckbox).toBeDisabled();
    expect(metricsStreamCheckbox).toBeChecked();
    expect(prodClusterCheckbox).toBeChecked();

    // Unselect "Automatically include all" checkbox
    await userEvent.click(autoIncludeAllCheckbox);
    expect(autoIncludeAllCheckbox).not.toBeChecked();
    expect(headerTableCheckbox).not.toBeChecked();
    expect(gkeProdCheckbox).toBeDisabled();
    expect(metricsStreamCheckbox).not.toBeChecked();
    expect(prodClusterCheckbox).not.toBeChecked();
  });

  it('should keep checkboxes selection after sorting', async () => {
    await renderComponentWithoutSelectedClusters();
    const gkeProdCheckbox = getCheckboxByClusterName('gke-prod-europe-west1');
    const metricsStreamCheckbox = getCheckboxByClusterName(
      'metrics-stream-cluster'
    );
    const prodClusterCheckbox = getCheckboxByClusterName('prod-cluster-eu');

    const sortHeader = screen.getByRole('columnheader', {
      name: 'Cluster Name',
    });

    // Select "prod-cluster-eu" cluster
    await userEvent.click(prodClusterCheckbox);
    expect(gkeProdCheckbox).not.toBeChecked();
    expect(metricsStreamCheckbox).not.toBeChecked();
    expect(prodClusterCheckbox).toBeChecked();

    // Sort by Cluster Name descending
    queryMocks.useOrderV2.mockReturnValue({
      order: 'desc',
      orderBy: 'label',
      sortedData: clusters.reverse(),
    });

    await userEvent.click(sortHeader);
    expect(gkeProdCheckbox).not.toBeChecked();
    expect(metricsStreamCheckbox).not.toBeChecked();
    expect(prodClusterCheckbox).toBeChecked();
  });
});
