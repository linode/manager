import { Grid } from '@mui/material';
import React from 'react';

import { dashboardFactory } from 'src/factories';
import { renderWithTheme } from 'src/utilities/testHelpers';

import RenderComponent from '../shared/CloudPulseComponentRenderer';
import { RESOURCE_ID } from '../Utils/constants';
import {
  getNodeTypeProperties,
  getRegionProperties,
  getResourcesProperties,
  getTagsProperties,
} from '../Utils/FilterBuilder';

describe('ComponentRenderer component tests', () => {
  it('it should render provided tag filter in props', () => {
    const tagProps = {
      configuration: {
        dependency: ['region'],
        filterKey: 'tags',
        filterType: 'string',
        isFilterable: false,
        isMetricsFilter: false,
        isMultiSelect: true,
        isOptional: true,
        name: 'Tags',
        neededInServicePage: false,
        placeholder: 'Select Tags',
        priority: 4,
      },
      name: 'Tags',
    };
    const mockDashboard = dashboardFactory.build({
      service_type: 'linode',
    });

    const { getByPlaceholderText } = renderWithTheme(
      <Grid item sx={{ marginLeft: 2 }} xs>
        {RenderComponent({
          componentKey: 'tags',
          componentProps: {
            ...getTagsProperties(
              {
                config: tagProps,
                dashboard: mockDashboard,
                isServiceAnalyticsIntegration: false,
              },
              vi.fn()
            ),
          },
          key: 'tags',
        })}
      </Grid>
    );

    expect(getByPlaceholderText('Select Tags')).toBeDefined();
  });

  it('it should render provided region filter in props', () => {
    const regionProps = {
      configuration: {
        filterKey: 'region',
        filterType: 'string',
        isFilterable: false,
        isMetricsFilter: false,
        name: 'Region',
        neededInServicePage: false,
        priority: 1,
      },
      name: 'Region',
    };
    const mockDashboard = dashboardFactory.build({
      service_type: 'linode',
    });

    const { getByPlaceholderText } = renderWithTheme(
      <Grid item sx={{ marginLeft: 2 }} xs>
        {RenderComponent({
          componentKey: 'region',
          componentProps: {
            ...getRegionProperties(
              {
                config: regionProps,
                dashboard: mockDashboard,
                isServiceAnalyticsIntegration: false,
              },
              vi.fn()
            ),
          },
          key: 'region',
        })}
      </Grid>
    );

    expect(getByPlaceholderText('Select a Region')).toBeDefined();
  });

  it('it should render provided resource filter in props', () => {
    const resourceProps = {
      configuration: {
        dependency: ['region', 'tags'],
        filterKey: 'resource_id',
        filterType: 'string',
        isFilterable: true,
        isMetricsFilter: true,
        isMultiSelect: true,
        name: 'Resources',
        neededInServicePage: false,
        placeholder: 'Select Resources',
        priority: 2,
      },
      name: 'Resources',
    };
    const mockDashboard = dashboardFactory.build({
      service_type: 'linode',
    });

    const { getByPlaceholderText } = renderWithTheme(
      <Grid item key={'resources'} sx={{ marginLeft: 2 }} xs>
        {RenderComponent({
          componentKey: 'resource_id',
          componentProps: {
            ...getResourcesProperties(
              {
                config: resourceProps,
                dashboard: mockDashboard,
                dependentFilters: { region: 'us-east' },
                isServiceAnalyticsIntegration: false,
              },
              vi.fn()
            ),
          },
          key: 'resource_id',
        })}
      </Grid>
    );
    expect(getByPlaceholderText('Select Resources')).toBeDefined();
  });

  it('it should render provided node type filter in props', () => {
    const nodeTypeProps = {
      configuration: {
        dependency: [RESOURCE_ID],
        filterKey: 'node_type',
        filterType: 'string',
        isFilterable: true,
        isMetricsFilter: false,
        isMultiSelect: false,
        name: 'Node Type',
        neededInServicePage: true,
        placeholder: 'Select a Node Type',
        priority: 5,
      },
      name: 'Node Type',
    };
    const mockDashboard = dashboardFactory.build({
      service_type: 'dbaas',
    });

    const { getByPlaceholderText } = renderWithTheme(
      <Grid item sx={{ marginLeft: 2 }} xs>
        {RenderComponent({
          componentKey: 'node_type',
          componentProps: {
            ...getNodeTypeProperties(
              {
                config: nodeTypeProps,
                dashboard: mockDashboard,
                dependentFilters: { resource_id: '1' },
                isServiceAnalyticsIntegration: false,
              },
              vi.fn()
            ),
          },
          key: 'node_type',
        })}
      </Grid>
    );
    expect(getByPlaceholderText('Select a Node Type')).toBeDefined();
  });
});
