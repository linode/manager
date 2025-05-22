import { regionFactory } from '@linode/utilities';
import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import { databaseFactory } from 'src/factories';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { AlertRegions } from './AlertRegions';

import type { AlertServiceType } from '@linode/api-v4';
import type { Flags } from 'src/featureFlags';

const regions = regionFactory.buildList(6);
const serviceType: AlertServiceType = 'dbaas';

const flags: Partial<Flags> = {
  aclpResourceTypeMap: [
    {
      serviceType,
      supportedRegionIds: regions.map(({ id }) => id).join(','),
      dimensionKey: 'region',
    },
  ],
};

const queryMocks = vi.hoisted(() => ({
  useFlags: vi.fn(),
  useRegionsQuery: vi.fn(),
  useResourcesQuery: vi.fn(),
}));

vi.mock('@linode/queries', async (importOriginal) => ({
  ...(await importOriginal()),
  useRegionsQuery: queryMocks.useRegionsQuery,
}));

vi.mock('src/queries/cloudpulse/resources', async (importOriginal) => ({
  ...(await importOriginal()),
  useResourcesQuery: queryMocks.useResourcesQuery,
}));

vi.mock('src/hooks/useFlags', async (importOriginal) => ({
  ...(await importOriginal()),
  useFlags: queryMocks.useFlags,
}));

queryMocks.useRegionsQuery.mockReturnValue({
  data: regions,
  isLoading: false,
  isErrro: false,
});

queryMocks.useResourcesQuery.mockReturnValue({
  data: databaseFactory.buildList(6, { region: regions[0].id }),
  isLoading: false,
  isError: false,
});

queryMocks.useFlags.mockReturnValue({
  flags: {},
});

const component = (
  <AlertRegions handleChange={vi.fn()} serviceType={serviceType} />
);
describe('Alert Regions', () => {
  it('Should render the filters and notices ', () => {
    renderWithTheme(component, { flags });
    const text = screen.getByText(
      'All resources associated with selected regions will be included in this alert definition.'
    );

    const regionSearch = screen.getByTestId('region-search');
    const showSelectedOnly = screen.getByTestId('show-selected-only');
    const noticeInfo = screen.getByTestId('notice-info');
    expect(text).toBeInTheDocument();

    expect(regionSearch).toBeInTheDocument();
    expect(showSelectedOnly).toBeInTheDocument();
    expect(noticeInfo).toBeInTheDocument();
  });

  it('should select all regions when the select all checkbox is checked', async () => {
    renderWithTheme(component, { flags });

    const selectAllCheckbox = within(
      screen.getByTestId('select-all-checkbox')
    ).getByRole('checkbox');
    await userEvent.click(selectAllCheckbox);

    expect(selectAllCheckbox).toBeChecked();

    const notice = screen.getByTestId('selection_notice');

    expect(notice.textContent).toBe('1 of 1 regions are selected.');
  });

  it('should show only header on click of show selected only', async () => {
    renderWithTheme(component, { flags });

    const checkbox = within(screen.getByTestId('show-selected-only')).getByRole(
      'checkbox'
    );

    await userEvent.click(checkbox);
    expect(checkbox).toBeChecked();

    expect(screen.getAllByRole('row').length).toBe(1); // Only header row should be visible
  });
});
