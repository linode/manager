import userEvent from '@testing-library/user-event';
import React from 'react';

import { imageFactory, regionFactory } from 'src/factories';
import { makeResourcePage } from 'src/mocks/serverHandlers';
import { HttpResponse, http, server } from 'src/mocks/testServer';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { SelectRegionPanel } from './SelectRegionPanel';

import type { Capabilities } from '@linode/api-v4';

const pricingMocks = vi.hoisted(() => ({
  isLinodeTypeDifferentPriceInSelectedRegion: vi.fn().mockReturnValue(false),
}));

vi.mock('src/utilities/pricing/linodes', () => ({
  isLinodeTypeDifferentPriceInSelectedRegion:
    pricingMocks.isLinodeTypeDifferentPriceInSelectedRegion,
}));

const createPath = '/linodes/create';

describe('SelectRegionPanel on the Clone Flow', () => {
  const regions = [...regionFactory.buildList(3)];
  const mockedProps = {
    currentCapability: 'Linodes' as Capabilities,
    handleSelection: () => vi.fn(),
    regions,
    selectedLinodeTypeId: 'g6-standard-2',
  };

  it('renders expected content on initial render', () => {
    const {
      container,
      getAllByRole,
      getByRole,
      getByTestId,
      getByText,
    } = renderWithTheme(<SelectRegionPanel {...mockedProps} />, {
      MemoryRouter: {
        initialEntries: [createPath],
      },
    });

    // Header
    expect(getByRole('heading')).toHaveTextContent('Region');

    // Helper Text
    expect(getByTestId('region-select-helper-test')).toHaveTextContent(
      'You can use our speedtest page to find the best region for your current location.'
    );

    // Links
    const links = getAllByRole('link');
    expect(links).toHaveLength(2);
    expect(getByText('How Data Center Pricing Works')).toBeInTheDocument();
    expect(links[0]).toHaveAttribute('href', 'https://www.linode.com/pricing');
    expect(links[1]).toHaveAttribute(
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
          initialEntries: [
            '/linodes/create?regionID=us-east&type=Clone+Linode',
          ],
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
          initialEntries: [
            '/linodes/create?regionID=us-east&type=Clone+Linode',
          ],
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

    const { getAllByRole, getByTestId } = renderWithTheme(
      <SelectRegionPanel {...mockedProps} selectedId="br-gru" />,
      {
        MemoryRouter: {
          initialEntries: [
            '/linodes/create?regionID=us-east&type=Clone+Linode',
          ],
        },
      }
    );

    const warnings = getAllByRole('alert');
    expect(warnings).toHaveLength(2);
    expect(getByTestId('cross-data-center-notice')).toBeInTheDocument();
    expect(getByTestId('different-price-structure-notice')).toBeInTheDocument();
  });

  it('should disable distributed regions if the selected image does not have the `distributed-sites` capability', async () => {
    const image = imageFactory.build({ capabilities: [] });

    const distributedRegion = regionFactory.build({
      capabilities: ['Linodes'],
      site_type: 'distributed',
    });
    const coreRegion = regionFactory.build({
      capabilities: ['Linodes'],
      site_type: 'core',
    });

    server.use(
      http.get('*/v4/regions', () => {
        return HttpResponse.json(
          makeResourcePage([coreRegion, distributedRegion])
        );
      }),
      http.get('*/v4/images', () => {
        return HttpResponse.json(makeResourcePage([image]));
      })
    );

    const { findByText, getByLabelText } = renderWithTheme(
      <SelectRegionPanel
        currentCapability="Linodes"
        handleSelection={vi.fn()}
        selectedImageId={image.id}
      />,
      {
        MemoryRouter: { initialEntries: ['/linodes/create?type=Images'] },
      }
    );

    const regionSelect = getByLabelText('Region');

    await userEvent.click(regionSelect);

    const distributedRegionOption = await findByText(distributedRegion.id, {
      exact: false,
    });

    expect(distributedRegionOption.closest('li')?.textContent).toContain(
      'The selected image cannot be deployed to a distributed region.'
    );
  });
});
