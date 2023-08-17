import { render } from '@testing-library/react';
import * as React from 'react';

import { getDCSpecificPricingDisplay } from './dynamicPricing';

import type { DataCenterPricingProps } from './dynamicPricing';

import { getBackupPrice } from './entityPricing';

describe('getDCSpecificPricingDisplay', () => {
  it('calculates dynamic pricing for a region without an upcost', () => {
    const props: DataCenterPricingProps = {
      entity: 'Backup',
      regionId: 'us-east',
    };

    const { getByTestId } = render(
      <div data-testid="price">{getDCSpecificPricingDisplay(props)}</div>
    );

    const priceElement = getByTestId('price');
    expect(priceElement).toBeInTheDocument(); // Make sure the element is in the document
    expect(priceElement.textContent).toBe(getBackupPrice().toFixed(2));
  });

  it('calculates dynamic pricing for a region with an upcost', () => {
    const props: DataCenterPricingProps = {
      entity: 'Volume',
      regionId: 'id-cgk',
      size: 20,
    };

    const { getByTestId } = render(
      <div data-testid="price">{getDCSpecificPricingDisplay(props)}</div>
    );

    const priceElement = getByTestId('price');
    expect(priceElement).toBeInTheDocument(); // Make sure the element is in the document
    expect(priceElement.textContent).toBe('2.40');
  });

  it('handles default case correctly', () => {
    const props: DataCenterPricingProps = {
      entity: 'InvalidEntity' as DataCenterPricingProps['entity'],
      regionId: 'invalid-region',
    };

    const { getByTestId } = render(
      <div data-testid="price">{getDCSpecificPricingDisplay(props)}</div>
    );

    const priceElement = getByTestId('price');
    expect(priceElement).toBeInTheDocument(); // Make sure the element is in the document
    expect(priceElement.textContent).toBe('0.00');
  });
});
