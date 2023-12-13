import React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { GaugePercent, GaugePercentProps } from './GaugePercent';

vi.mock('@mui/material/styles', async () => {
  const actual = await vi.importActual('@mui/material/styles');
  return {
    ...actual,
    useTheme: () => ({
      color: {
        grey2: '#f4f4f4',
      },
      palette: {
        primary: {
          main: '#3683dc',
        },
      },
    }),
  };
});

describe('GaugePercent Component', () => {
  const defaultProps: GaugePercentProps = {
    max: 100,
    value: 50,
  };

  it('renders without crashing', () => {
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
