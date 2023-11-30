import React from 'react';
import { regionFactory } from 'src/factories';
import { renderWithTheme } from 'src/utilities/testHelpers';
import { SelectRegionPanel } from './SelectRegionPanel';

const pricingMocks = vi.hoisted(() => ({
  doesRegionHaveUniquePricing: vi.fn().mockReturnValue(false),
  isLinodeTypeDifferentPriceInSelectedRegion: vi.fn().mockReturnValue(false),
}));

const queryParamMocks = vi.hoisted(() => ({
  getQueryParamsFromQueryString: vi.fn().mockReturnValue({}),
}));

vi.mock('src/utilities/pricing/linodes', () => ({
  doesRegionHaveUniquePricing: pricingMocks.doesRegionHaveUniquePricing,
  isLinodeTypeDifferentPriceInSelectedRegion:
    pricingMocks.isLinodeTypeDifferentPriceInSelectedRegion,
}));

vi.mock('src/utilities/queryParams', () => ({
  getQueryParamsFromQueryString: queryParamMocks.getQueryParamsFromQueryString,
}));

const createPath = '/linodes/create';

describe('SelectRegionPanel in Create Flow', () => {
  beforeEach(() => {
    pricingMocks.doesRegionHaveUniquePricing.mockReturnValue(true);
  });

  it('should render a notice when the selected region has unique pricing', async () => {
    const regions = regionFactory.buildList(1, {
      id: 'id-cgk',
      label: 'Jakarta, ID',
    });

    const { findByText } = renderWithTheme(
      <SelectRegionPanel
        currentCapability={undefined}
        handleSelection={vi.fn()}
        regions={regions}
        selectedId="id-cgk"
      />,

      {
        MemoryRouter: { initialEntries: [createPath] },
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
    pricingMocks.doesRegionHaveUniquePricing.mockReturnValue(false);
    queryParamMocks.getQueryParamsFromQueryString.mockReturnValue({
      regionID: 'us-east',
      type: 'Clone+Linode',
    });
  });

  const regions = [...regionFactory.buildList(3)];
  const mockedProps = {
    currentCapability: undefined,
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
    expect(container.querySelector('[role="combobox"]')).toHaveAttribute(
      'placeholder',
      'Select a Region'
    );
  });

  it('displays no notice when cloning to the same region', () => {
    pricingMocks.isLinodeTypeDifferentPriceInSelectedRegion.mockReturnValue(
      false
    );
    const { queryAllByRole } = renderWithTheme(
      <SelectRegionPanel {...mockedProps} selectedId="us-east" />,
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
    pricingMocks.isLinodeTypeDifferentPriceInSelectedRegion.mockReturnValue(
      false
    );

    const { getAllByRole, getByTestId } = renderWithTheme(
      <SelectRegionPanel {...mockedProps} selectedId="us-west" />,
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
    pricingMocks.isLinodeTypeDifferentPriceInSelectedRegion.mockReturnValue(
      true
    );
    pricingMocks.doesRegionHaveUniquePricing.mockReturnValue(true);

    const { getAllByRole, getByTestId } = renderWithTheme(
      <SelectRegionPanel {...mockedProps} selectedId="br-gru" />,
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
