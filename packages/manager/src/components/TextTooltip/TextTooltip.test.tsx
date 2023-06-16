import React from 'react';
import { renderWithTheme } from 'src/utilities/testHelpers';
import { fireEvent } from '@testing-library/react';
import { TextTooltip } from './TextTooltip';

describe('TextTooltip', () => {
  it('renders the display text and displays the tooltip on hover', async () => {
    const props = {
      displayText: 'Hover me',
      tooltipText: 'This is a tooltip',
    };

    const { findByRole, getByText, queryByRole } = renderWithTheme(
      <TextTooltip {...props} />
    );

    expect(queryByRole(/tooltip/)).not.toBeInTheDocument();
    expect(getByText(props.displayText)).toBeInTheDocument();

    fireEvent.mouseEnter(getByText(props.displayText));

    const tooltip = await findByRole(/tooltip/);

    expect(tooltip).toBeInTheDocument();
  });

  it('Sets the tooltip placement to "bottom" by default', async () => {
    const props = {
      displayText: 'Hover me',
      tooltipText: 'This is a tooltip',
    };

    const { getByText, findByRole } = renderWithTheme(
      <TextTooltip {...props} />
    );
    fireEvent.mouseEnter(getByText(props.displayText));

    const tooltip = await findByRole(/tooltip/);

    expect(tooltip).toHaveAttribute('data-popper-placement', 'bottom');
  });

  it('Applies custom styles to the Typography component', () => {
    const props = {
      displayText: 'Hover me',
      tooltipText: 'This is a tooltip',
      sxTypography: {
        color: 'red',
        fontSize: '18px',
      },
    };

    const { getByText } = renderWithTheme(<TextTooltip {...props} />);

    const displayText = getByText(props.displayText);

    expect(displayText).toHaveStyle('color: rgb(54, 131, 220)');
    expect(displayText).toHaveStyle('font-size: 18px');
  });
});
