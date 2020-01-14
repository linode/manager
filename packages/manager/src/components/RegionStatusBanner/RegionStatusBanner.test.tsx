import { cleanup } from '@testing-library/react';
import * as React from 'react';
import { regionFactory } from 'src/factories/regions';
import { renderWithTheme } from 'src/utilities/testHelpers';
import { CombinedProps, RegionStatusBanner } from './RegionStatusBanner';

afterEach(cleanup);

const props = (regionsData: any): CombinedProps => ({
  regionsData,
  regionsLoading: false,
  regionsLastUpdated: Date.now()
});

describe('Region status banner', () => {
  it('should render null if there are no warnings', () => {
    const regions = regionFactory.buildList(10);
    expect(RegionStatusBanner(props(regions))).toBeNull();
  });

  it("should render a banner for each region with a status of 'outage'", () => {
    const regions = regionFactory.buildList(5, { status: 'outage' });
    const { queryAllByText } = renderWithTheme(
      <RegionStatusBanner {...props(regions)} />
    );
    expect(queryAllByText(/we are aware/i)).toHaveLength(5);
  });

  it('should filter out regions with no issues', () => {
    const regions = [
      ...regionFactory.buildList(3, { status: 'outage' }),
      ...regionFactory.buildList(2, { status: 'ok' })
    ];
    const { queryAllByText } = renderWithTheme(
      <RegionStatusBanner {...props(regions)} />
    );
    expect(queryAllByText(/we are aware/i)).toHaveLength(3);
  });

  it('should include the name of a problem region', () => {
    const regions = regionFactory.buildList(1, {
      id: 'us-east',
      status: 'outage'
    });
    const { getByText } = renderWithTheme(
      <RegionStatusBanner {...props(regions)} />
    );
    getByText(/Newark, NJ/);
  });
});
