import * as React from 'react';
import { regionFactory } from 'src/factories/regions';
import { renderWithTheme } from 'src/utilities/testHelpers';
import { RegionStatusBanner } from './RegionStatusBanner';

afterEach(() => {
  regionFactory.resetSequenceNumber();
});

describe('Region status banner', () => {
  it('should render null if there are no warnings', () => {
    const regions = regionFactory.buildList(5);
    expect(RegionStatusBanner({ regions })).toBeNull();
  });

  it("should render the region's name, and not a list, for a single affected region", () => {
    const regions = regionFactory.buildList(1, {
      status: 'outage',
      id: 'us-east',
    });
    const { queryAllByText, queryAllByTestId } = renderWithTheme(
      <RegionStatusBanner regions={regions} />
    );
    expect(queryAllByText(/Newark, NJ/i)).toHaveLength(1);
    expect(queryAllByTestId(/facility-outage/)).toHaveLength(0);
  });

  it("should render a list with each region with a status of 'outage' when there are more than one such region", () => {
    const regions = regionFactory.buildList(5, {
      status: 'outage',
    });
    const { queryAllByTestId } = renderWithTheme(
      <RegionStatusBanner regions={regions} />
    );
    expect(queryAllByTestId(/facility-outage/)).toHaveLength(5);
  });

  it('should filter out regions with no issues', () => {
    const badRegions = regionFactory.buildList(3, { status: 'outage' });
    const goodRegions = regionFactory.buildList(2, { status: 'ok' });
    const regions = [...badRegions, ...goodRegions];
    const { queryAllByTestId } = renderWithTheme(
      <RegionStatusBanner regions={regions} />
    );
    expect(queryAllByTestId(/facility-outage/)).toHaveLength(3);
  });
});
