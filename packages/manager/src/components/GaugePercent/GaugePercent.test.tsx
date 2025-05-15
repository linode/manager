import React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { GaugePercent } from './GaugePercent';

import type { GaugePercentProps } from './GaugePercent';

describe('GaugePercent Component', () => {
  const defaultProps: GaugePercentProps = {
    max: 100,
    value: 50,
  };

  it('renders', () => {
    const { getByTestId } = renderWithTheme(<GaugePercent {...defaultProps} />);
    const gaugeWrapper = getByTestId('gauge-wrapper');

    expect(gaugeWrapper).toBeInTheDocument();
  });

  it('renders the inner text when provided', () => {
    const innerText = '50%';
    const { getByTestId } = renderWithTheme(
      <GaugePercent {...defaultProps} innerText={innerText} />
    );
    const gaugeInnerText = getByTestId('gauge-innertext');

    expect(gaugeInnerText).toBeInTheDocument();
    expect(gaugeInnerText).toHaveTextContent(innerText);
  });

  it('renders the subtitle when provided', () => {
    const subTitle = 'Subtitle';
    const { getByTestId } = renderWithTheme(
      <GaugePercent {...defaultProps} subTitle={subTitle} />
    );
    const gaugeSubText = getByTestId('gauge-subtext');

    expect(gaugeSubText).toBeInTheDocument();
    expect(gaugeSubText).toHaveTextContent(subTitle);
  });
});
