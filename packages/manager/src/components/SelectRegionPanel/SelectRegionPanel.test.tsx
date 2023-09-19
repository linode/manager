import React from 'react';

import { linodeTypeFactory, regionFactory } from 'src/factories';
import { makeResourcePage } from 'src/mocks/serverHandlers';
import { rest, server } from 'src/mocks/testServer';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { SelectRegionPanel } from './SelectRegionPanel';

jest.mock('src/utilities/pricing/linodes', () => ({
  doesRegionHaveUniquePricing: jest.fn(() => true),
  isLinodeTypeDifferentPriceInSelectedRegion: jest.fn(() => false),
}));
jest.mock('src/utilities/queryParams', () => ({
  getQueryParamsFromQueryString: jest.fn(() => ({})),
}));
jest.mock('src/hooks/useFlags', () => ({
  useFlags: () => ({
    dcSpecificPricing: true,
  }),
}));

describe('SelectRegionPanel', () => {
  it('should render a notice when the selected region has unique pricing and the flag is on', async () => {
    server.use(
      rest.get('*/linode/types', (req, res, ctx) => {
        const types = linodeTypeFactory.buildList(1, {
          region_prices: [
            {
              hourly: 2,
              id: 'id-cgk',
              monthly: 2,
            },
          ],
        });
        return res(ctx.json(makeResourcePage(types)));
      })
    );

    jest.mock('react-router-dom', () => ({
      ...jest.requireActual('react-router-dom'),
      useLocation: () => ({
        pathname: '/linodes/create',
      }),
    }));

    const regions = regionFactory.buildList(1, {
      id: 'id-cgk',
      label: 'Jakarta, ID',
    });

    const { findByText } = renderWithTheme(
      <SelectRegionPanel
        handleSelection={jest.fn()}
        regions={regions}
        selectedID="id-cgk"
      />,
      { flags: { dcSpecificPricing: true } }
    );

    await findByText(
      `Prices for plans, products, and services in ${regions[0].label} may vary from other regions.`,
      { exact: false }
    );
  });
});

describe.only('SelectRegionPanel on the Clone Flow', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const regions = [...regionFactory.buildList(3)];
  const mockedProps = {
    handleSelection: () => jest.fn(),
    regions,
    selectedLinodeTypeId: 'g6-standard-2',
  };

  it('renders expected content on initial render', () => {
    const { container, getAllByRole, getByRole, getByTestId } = renderWithTheme(
      <SelectRegionPanel {...mockedProps} />
    );

    // Header
    expect(getByRole('heading')).toHaveTextContent('Region');

    // Helper Text
    expect(getByTestId('region-select-helper-test')).toHaveTextContent(
      'You can use our speedtest page to find the best region for your current location.'
    );

    // Links
    const links = getAllByRole('link');
    expect(links).toHaveLength(1);
    expect(links[0]).toHaveAttribute(
      'href',
      'https://www.linode.com/speed-test/'
    );

    // Select
    expect(
      container.querySelector('[data-qa-textfield-label]')
    ).toHaveTextContent('Region');
    expect(
      container.querySelector('[data-qa-select-placeholder]')
    ).toHaveTextContent('Select a Region');
  });

  it('displays only the dynamic pricing notice when cloning to same region', () => {
    jest
      .spyOn(
        require('src/utilities/queryParams'),
        'getQueryParamsFromQueryString'
      )
      .mockReturnValue({
        regionID: 'br-gru',
        type: 'Clone+Linode',
      });
    jest
      .spyOn(
        require('src/utilities/pricing/linodes'),
        'isLinodeTypeDifferentPriceInSelectedRegion'
      )
      .mockReturnValue(false);

    const { getAllByRole, getByTestId } = renderWithTheme(
      <SelectRegionPanel {...mockedProps} selectedID="br-gru" />
    );

    const warnings = getAllByRole('alert');
    expect(warnings).toHaveLength(1);
    expect(getByTestId('dynamic-pricing-notice')).toBeInTheDocument();
  });

  it('displays the region and cloning notices when cloning to a different region with the same price', () => {
    jest
      .spyOn(
        require('src/utilities/queryParams'),
        'getQueryParamsFromQueryString'
      )
      .mockReturnValue({
        regionID: 'us-east',
        type: 'Clone+Linode',
      });
    jest
      .spyOn(
        require('src/utilities/pricing/linodes'),
        'isLinodeTypeDifferentPriceInSelectedRegion'
      )
      .mockReturnValue(false);

    const { getAllByRole, getByTestId } = renderWithTheme(
      <SelectRegionPanel {...mockedProps} selectedID="us-west" />
    );

    const warnings = getAllByRole('alert');
    expect(warnings).toHaveLength(1);
    expect(getByTestId('cross-data-center-notice')).toBeInTheDocument();
  });

  it.only('displays the cloning and price structure notices when cloning to a different region with a different price', () => {
    jest
      .spyOn(
        require('src/utilities/queryParams'),
        'getQueryParamsFromQueryString'
      )
      .mockReturnValue({
        regionID: 'us-east',
        type: 'Clone+Linode',
      });
    jest
      .spyOn(
        require('src/utilities/pricing/linodes'),
        'isLinodeTypeDifferentPriceInSelectedRegion'
      )
      .mockReturnValue(true);

    const { getAllByRole, getByTestId } = renderWithTheme(
      <SelectRegionPanel {...mockedProps} selectedID="br-gru" />
    );

    const warnings = getAllByRole('alert');
    expect(warnings).toHaveLength(3);
    expect(getByTestId('cross-data-center-notice')).toBeInTheDocument();
    expect(getByTestId('different-price-structure-notice')).toBeInTheDocument();
  });
});
