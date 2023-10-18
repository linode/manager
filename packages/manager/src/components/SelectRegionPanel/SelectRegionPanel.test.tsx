import React from 'react';

import { linodeTypeFactory, regionFactory } from 'src/factories';
import { makeResourcePage } from 'src/mocks/serverHandlers';
import { rest, server } from 'src/mocks/testServer';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { SelectRegionPanel } from './SelectRegionPanel';

vi.mock('src/utilities/pricing/linodes', () => ({
  doesRegionHaveUniquePricing: vi.fn(() => false),
  isLinodeTypeDifferentPriceInSelectedRegion: vi.fn(() => false),
}));
vi.mock('src/utilities/queryParams', () => ({
  getQueryParamsFromQueryString: vi.fn(() => ({})),
}));
vi.mock('src/hooks/useFlags', () => ({
  useFlags: () => ({
    dcSpecificPricing: true,
  }),
}));

const createPath = '/linodes/create';

describe('SelectRegionPanel in Create Flow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi
      .spyOn(
        require('src/utilities/pricing/linodes'),
        'doesRegionHaveUniquePricing'
      )
      .mockReturnValue(true);
  });

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

    const regions = regionFactory.buildList(1, {
      id: 'id-cgk',
      label: 'Jakarta, ID',
    });

    const { findByText } = renderWithTheme(
      <SelectRegionPanel
        handleSelection={vi.fn()}
        regions={regions}
        selectedID="id-cgk"
      />,

      {
        MemoryRouter: { initialEntries: [createPath] },
        flags: { dcSpecificPricing: true },
      }
    );

    await findByText(
      `Prices for plans, products, and services in ${regions[0].label} may vary from other regions.`,
      { exact: false }
    );
  });
});

describe('SelectRegionPanel on the Clone Flow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi
      .spyOn(
        require('src/utilities/queryParams'),
        'getQueryParamsFromQueryString'
      )
      .mockReturnValue({
        regionID: 'us-east',
        type: 'Clone+Linode',
      });
    vi
      .spyOn(
        require('src/utilities/pricing/linodes'),
        'doesRegionHaveUniquePricing'
      )
      .mockReturnValue(false);
  });

  const regions = [...regionFactory.buildList(3)];
  const mockedProps = {
    handleSelection: () => vi.fn(),
    regions,
    selectedLinodeTypeId: 'g6-standard-2',
  };

  it('renders expected content on initial render', () => {
    const { container, getAllByRole, getByRole, getByTestId } = renderWithTheme(
      <SelectRegionPanel {...mockedProps} />,
      {
        MemoryRouter: {
          initialEntries: [createPath],
        },
      }
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

  it('displays no notice when cloning to the same region', () => {
    vi
      .spyOn(
        require('src/utilities/pricing/linodes'),
        'isLinodeTypeDifferentPriceInSelectedRegion'
      )
      .mockReturnValue(false);

    const { queryAllByRole } = renderWithTheme(
      <SelectRegionPanel {...mockedProps} selectedID="us-east" />,
      {
        MemoryRouter: {
          initialEntries: [createPath],
        },
      }
    );

    const warnings = queryAllByRole('alert');
    expect(warnings).toHaveLength(0);
  });

  it('displays the region cloning notice when cloning to a different region with the same price', () => {
    vi
      .spyOn(
        require('src/utilities/pricing/linodes'),
        'isLinodeTypeDifferentPriceInSelectedRegion'
      )
      .mockReturnValue(false);

    const { getAllByRole, getByTestId } = renderWithTheme(
      <SelectRegionPanel {...mockedProps} selectedID="us-west" />,
      {
        MemoryRouter: {
          initialEntries: [createPath],
        },
      }
    );

    const warnings = getAllByRole('alert');
    expect(warnings).toHaveLength(1);
    expect(getByTestId('cross-data-center-notice')).toBeInTheDocument();
  });

  it('displays the cloning and price structure notices when cloning to a different region with a different price', () => {
    vi
      .spyOn(
        require('src/utilities/pricing/linodes'),
        'isLinodeTypeDifferentPriceInSelectedRegion'
      )
      .mockReturnValue(true);
    vi
      .spyOn(
        require('src/utilities/pricing/linodes'),
        'doesRegionHaveUniquePricing'
      )
      .mockReturnValue(true);

    const { getAllByRole, getByTestId } = renderWithTheme(
      <SelectRegionPanel {...mockedProps} selectedID="br-gru" />,
      {
        MemoryRouter: {
          initialEntries: [createPath],
        },
      }
    );

    const warnings = getAllByRole('alert');
    expect(warnings).toHaveLength(2);
    expect(getByTestId('cross-data-center-notice')).toBeInTheDocument();
    expect(getByTestId('different-price-structure-notice')).toBeInTheDocument();
  });
});
