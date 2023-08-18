import { render } from '@testing-library/react';
import * as React from 'react';

import { BACKUP_PRICE } from './constants';
import { getDCSpecificPricingDisplay } from './dynamicPricing';

import type { DataCenterPricingOptions } from './dynamicPricing';

describe('getDCSpecificPricingDisplay', () => {
  it('calculates dynamic pricing for a region without an increase', () => {
    const props: DataCenterPricingOptions = {
      entity: 'Backup',
      regionId: 'us-east',
    };

    const { getByTestId } = render(
      <div data-testid="price">{getDCSpecificPricingDisplay(props)}</div>
    );

    const priceElement = getByTestId('price');
    expect(priceElement).toBeInTheDocument();
    expect(priceElement.textContent).toBe(BACKUP_PRICE.toFixed(2));
  });

  it('calculates dynamic pricing for a region with an increase', () => {
    const props: DataCenterPricingOptions = {
      entity: 'Volume',
      regionId: 'id-cgk',
      size: 20,
    };

    const { getByTestId } = render(
      <div data-testid="price">{getDCSpecificPricingDisplay(props)}</div>
    );

    const priceElement = getByTestId('price');
    expect(priceElement).toBeInTheDocument();
    expect(priceElement.textContent).toBe('2.40');
  });

  it('handles default case correctly', () => {
    const props: DataCenterPricingOptions = {
      entity: 'InvalidEntity' as DataCenterPricingOptions['entity'],
      regionId: 'invalid-region',
    };

    const { getByTestId } = render(
      <div data-testid="price">{getDCSpecificPricingDisplay(props)}</div>
    );

    const priceElement = getByTestId('price');
    expect(priceElement).toBeInTheDocument();
    expect(priceElement.textContent).toBe('0.00');
  });
});
