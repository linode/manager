import { renderHook } from '@testing-library/react';
import React from 'react';

import { dashboardFactory } from 'src/factories';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { CloudPulseContext } from './CloudPulseContext';
import { CloudPulseContextProvider } from './CloudPulseContextProvider';

import type { FilterData } from '../Dashboard/CloudPulseDashboardLanding';

describe('CloudPulseContextProvider', () => {
  it('should render children correctly', () => {
    const TestChild = () => <div data-testid="test-child">Test Child</div>;
    const { getByTestId } = renderWithTheme(
      <CloudPulseContextProvider>
        <TestChild />
      </CloudPulseContextProvider>
    );
    const childElement = getByTestId('test-child');
    expect(childElement).toHaveTextContent('Test Child');
  });
  it('should provide context methods to children', () => {
    const { result } = renderHook(() => React.useContext(CloudPulseContext), {
      wrapper: CloudPulseContextProvider,
    });
    expect(result.current.setGlobalFilterData).toBeDefined();
    expect(result.current.getGlobalFilterData).toBeDefined();
    expect(result.current.setGlobalSelectedDashboard).toBeDefined();
    expect(result.current.getGlobalSelectedDashboard).toBeDefined();
    expect(result.current.setGlobalGroupBy).toBeDefined();
    expect(result.current.getGlobalGroupBy).toBeDefined();
  });
  it('should set and get filter data correctly', () => {
    const { result } = renderHook(() => React.useContext(CloudPulseContext), {
      wrapper: CloudPulseContextProvider,
    });

    const mockFilterData: FilterData = {
      id: { region: 'us-east', serviceType: 'linode' },
      label: { region: ['US East'], serviceType: ['Linode'] },
    };

    result.current.setGlobalFilterData(mockFilterData);
    const retrievedData = result.current.getGlobalFilterData();

    expect(retrievedData).toEqual(mockFilterData);
  });
  it('should return undefined when no filter data has been set', () => {
    const { result } = renderHook(() => React.useContext(CloudPulseContext), {
      wrapper: CloudPulseContextProvider,
    });

    const retrievedData = result.current.getGlobalFilterData();
    expect(retrievedData).toBeUndefined();
  });
  it('should handle complex filter data with arrays', () => {
    const { result } = renderHook(() => React.useContext(CloudPulseContext), {
      wrapper: CloudPulseContextProvider,
    });

    const complexFilterData: FilterData = {
      id: {
        regions: ['us-east', 'us-west'],
        linodeIds: [123, 456, 789],
        tags: ['production', 'monitoring'],
      },
      label: {
        regions: ['US East', 'US West'],
        linodeIds: ['Linode 123', 'Linode 456', 'Linode 789'],
        tags: ['production', 'monitoring'],
      },
    };

    result.current.setGlobalFilterData(complexFilterData);
    expect(result.current.getGlobalFilterData()).toEqual(complexFilterData);
  });
  it('should set and get dashboard correctly', () => {
    const { result } = renderHook(() => React.useContext(CloudPulseContext), {
      wrapper: CloudPulseContextProvider,
    });

    const mockDashboard = dashboardFactory.build({
      id: 123,
      label: 'Test Dashboard',
    });

    result.current.setGlobalSelectedDashboard(mockDashboard);
    const retrievedDashboard = result.current.getGlobalSelectedDashboard();

    expect(retrievedDashboard).toEqual(mockDashboard);
  });
  it('should return undefined when no dashboard has been set', () => {
    const { result } = renderHook(() => React.useContext(CloudPulseContext), {
      wrapper: CloudPulseContextProvider,
    });

    const retrievedDashboard = result.current.getGlobalSelectedDashboard();
    expect(retrievedDashboard).toBeUndefined();
  });
  it('should set and get group by correctly', () => {
    const { result } = renderHook(() => React.useContext(CloudPulseContext), {
      wrapper: CloudPulseContextProvider,
    });

    const mockGroupBy = ['region', 'service_type'];

    result.current.setGlobalGroupBy(mockGroupBy);
    const retrievedGroupBy = result.current.getGlobalGroupBy();

    expect(retrievedGroupBy).toEqual(mockGroupBy);
  });
  it('should return empty array when no group by has been set', () => {
    const { result } = renderHook(() => React.useContext(CloudPulseContext), {
      wrapper: CloudPulseContextProvider,
    });

    const retrievedGroupBy = result.current.getGlobalGroupBy();
    expect(retrievedGroupBy).toEqual([]);
  });
});
