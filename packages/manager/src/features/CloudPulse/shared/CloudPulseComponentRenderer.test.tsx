import { Grid } from '@mui/material';
import React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import RenderComponent from '../shared/CloudPulseComponentRenderer';
import {
  getRegionProperties,
  getResourcesProperties,
} from '../Utils/FilterBuilder';
import { FILTER_CONFIG } from '../Utils/FilterConfig';

const linodeFilterConfig = FILTER_CONFIG.get('linode');
const DASHBOARD = 'Test Metrics Dashboard';

describe('ComponentRenderer component tests', () => {
  it('it should render provided region filter in props', () => {
    const regionProps = linodeFilterConfig?.filters.find(
      (filter) => filter.configuration.filterKey == 'region'
    );

    const mockDashboard = {
      created: new Date().toDateString(),
      id: 1,
      label: DASHBOARD,
      service_type: 'linode',
      time_duration: { unit: 'min', value: 30 },
      updated: new Date().toDateString(),
      widgets: [],
    };

    const { getByPlaceholderText } = renderWithTheme(
      <Grid item key={'region'} sx={{ marginLeft: 2 }} xs>
        {RenderComponent({
          ...getRegionProperties(regionProps!, vi.fn(), mockDashboard, false),
          key: 1,
        })}
      </Grid>
    );

    expect(getByPlaceholderText('Select a Region')).toBeDefined();
  }),
    it('it should render provided resource filter in props', () => {
      const resourceProps = linodeFilterConfig?.filters.find(
        (filter) => filter.configuration.filterKey == 'resource_id'
      );

      const mockDashboard = {
        created: new Date().toDateString(),
        id: 1,
        label: DASHBOARD,
        service_type: 'linode',
        time_duration: { unit: 'min', value: 30 },
        updated: new Date().toDateString(),
        widgets: [],
      };

      const { getByPlaceholderText } = renderWithTheme(
        <Grid item key={'region'} sx={{ marginLeft: 2 }} xs>
          {RenderComponent({
            ...getResourcesProperties(
              resourceProps!,
              vi.fn(),
              mockDashboard,
              false,
              [{ region: 'us-east' }]
            ),
            key: 1,
          })}
        </Grid>
      );

      expect(getByPlaceholderText('Select Resources')).toBeDefined();
    });
});
