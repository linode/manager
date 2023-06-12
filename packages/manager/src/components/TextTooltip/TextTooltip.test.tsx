import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { TextTooltip } from './TextTooltip';

describe('TextTooltip', () => {
  it('renders the display text and displays the tooltip on hover', async () => {
    const props = {
      displayText: 'Hover me',
      tooltipText: 'This is a tooltip',
    };

    render(<TextTooltip {...props} />);

    expect(screen.queryByRole(/tooltip/)).not.toBeInTheDocument();
    expect(screen.getByText(props.displayText)).toBeInTheDocument();

    fireEvent.mouseEnter(screen.getByText(props.displayText));

    const tooltip = await screen.findByRole(/tooltip/);

    expect(tooltip).toBeInTheDocument();
  });

  it('Sets the tooltip placement to "bottom" by default', async () => {
    const props = {
      displayText: 'Hover me',
      tooltipText: 'This is a tooltip',
    };

    render(<TextTooltip {...props} />);
    fireEvent.mouseEnter(screen.getByText(props.displayText));

    const tooltip = await screen.findByRole(/tooltip/);

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

    const { getByText } = render(<TextTooltip {...props} />);

    const displayText = getByText(props.displayText);

    expect(displayText).toHaveStyle('color: rgb(25, 118, 210)');
    expect(displayText).toHaveStyle('font-size: 18px');
  });
});
