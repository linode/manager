import userEvent from '@testing-library/user-event';
import * as React from 'react';

import { dashboardFactory, regionFactory } from 'src/factories';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { DBAAS_CAPABILITY, LINODE_CAPABILITY } from '../Utils/FilterConfig';
import { CloudPulseRegionSelect } from './CloudPulseRegionSelect';

import type { CloudPulseRegionSelectProps } from './CloudPulseRegionSelect';
import type { Region } from '@linode/api-v4';
import type { useRegionsQuery } from '@linode/queries';
import type { CloudPulseResourceTypeMapFlag, Flags } from 'src/featureFlags';

const props: CloudPulseRegionSelectProps = {
  handleRegionChange: vi.fn(),
  label: 'Region',
  selectedDashboard: undefined,
};

const queryMocks = vi.hoisted(() => ({
  useRegionsQuery: vi.fn().mockReturnValue({}),
}));

const flags: Partial<Flags> = {
  aclpResourceTypeMap: [
    {
      serviceType: 'dbaas',
      supportedRegionIds: 'us-west, us-east',
    },
    {
      serviceType: 'linode',
      supportedRegionIds: 'us-lax, us-mia',
    },
  ] as CloudPulseResourceTypeMapFlag[],
};

vi.mock('@linode/queries', async (importOriginal) => ({
  ...(await importOriginal()),
  useRegionsQuery: queryMocks.useRegionsQuery,
}));

describe('CloudPulseRegionSelect', () => {
  it('should render a Region Select component', () => {
    const { getByLabelText, getByTestId } = renderWithTheme(
      <CloudPulseRegionSelect {...props} />
    );
    const { label } = props;
    expect(getByLabelText(label)).toBeInTheDocument();
    expect(getByTestId('region-select')).toBeInTheDocument();
  });

  it('should render a Region Select component with proper error message on api call failure', () => {
    queryMocks.useRegionsQuery.mockReturnValue({
      data: undefined,
      isError: true,
      isLoading: false,
    } as ReturnType<typeof useRegionsQuery>);
    const { getByText } = renderWithTheme(
      <CloudPulseRegionSelect {...props} />
    );

    expect(getByText('Failed to fetch Region.'));
  });

  it('should render a Region Select component with capability specific and launchDarkly based supported regions', async () => {
    const user = userEvent.setup();

    const allRegions: Region[] = [
      regionFactory.build({
        capabilities: [LINODE_CAPABILITY],
        id: 'us-lax',
        label: 'US, Los Angeles, CA',
      }),
      regionFactory.build({
        capabilities: [LINODE_CAPABILITY],
        id: 'us-mia',
        label: 'US, Miami, FL',
      }),
      regionFactory.build({
        capabilities: [DBAAS_CAPABILITY],
        id: 'us-west',
        label: 'US, Fremont, CA',
      }),
      regionFactory.build({
        capabilities: [DBAAS_CAPABILITY],
        id: 'us-east',
        label: 'US, Newark, NJ',
      }),
      regionFactory.build({
        capabilities: [DBAAS_CAPABILITY],
        id: 'us-central',
        label: 'US, Dallas, TX',
      }),
    ];

    queryMocks.useRegionsQuery.mockReturnValue({
      data: allRegions,
      isError: false,
      isLoading: false,
    });

    const { getByRole, queryByRole } = renderWithTheme(
      <CloudPulseRegionSelect
        {...props}
        // eslint-disable-next-line camelcase
        selectedDashboard={dashboardFactory.build({ service_type: 'dbaas' })}
      />,
      { flags }
    );

    await user.click(getByRole('button', { name: 'Open' }));
    // example: region id => 'us-west' belongs to service type - 'dbaas', capability -'Managed Databases', and is supported via launchDarkly
    expect(
      getByRole('option', {
        name: 'US, Fremont, CA (us-west)',
      })
    ).toBeInTheDocument();
    expect(
      getByRole('option', {
        name: 'US, Newark, NJ (us-east)',
      })
    ).toBeInTheDocument();
    expect(
      queryByRole('option', {
        name: 'US, Dallas, TX (us-central)',
      })
    ).toBeNull();
    expect(
      queryByRole('option', {
        name: 'US, Los Angeles, CA (us-lax)',
      })
    ).toBeNull();
    expect(
      queryByRole('option', {
        name: 'US, Miami, FL (us-mia)',
      })
    ).toBeNull();
  });
});
