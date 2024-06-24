import { fireEvent, waitFor } from '@testing-library/react';
import React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

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

    expect(queryByRole('tooltip')).not.toBeInTheDocument();
    expect(getByText(props.displayText)).toBeInTheDocument();

    fireEvent.mouseEnter(getByText(props.displayText));

    const tooltip = await findByRole('tooltip');

    expect(tooltip).toBeInTheDocument();
  });

  it('Sets the tooltip placement to "bottom" by default', async () => {
    const props = {
      displayText: 'Hover me',
      tooltipText: 'This is a tooltip',
    };

    const { findByRole, getByText } = renderWithTheme(
      <TextTooltip {...props} />
    );
    fireEvent.mouseEnter(getByText(props.displayText));

    const tooltip = await findByRole('tooltip');

    expect(tooltip).toHaveAttribute('data-popper-placement', 'bottom');
  });

  it('Applies custom styles to the Typography component', () => {
    const props = {
      displayText: 'Hover me',
      sxTypography: {
        color: 'red',
        fontSize: '18px',
      },
      tooltipText: 'This is a tooltip',
    };

    const { getByText } = renderWithTheme(<TextTooltip {...props} />);

    const displayText = getByText(props.displayText);

    expect(displayText).toHaveStyle('color: rgb(0, 156, 222)');
    expect(displayText).toHaveStyle('font-size: 18px');
  });

  it('the tooltip should disappear on mouseout', async () => {
    const props = {
      displayText: 'Hover me',
      tooltipText: 'This is a tooltip',
    };

    const { findByRole, getByText, queryByRole } = renderWithTheme(
      <TextTooltip {...props} />
    );

    fireEvent.mouseEnter(getByText(props.displayText));

    const tooltip = await findByRole('tooltip');

    expect(tooltip).toBeInTheDocument();

    fireEvent.mouseLeave(getByText(props.displayText));

    await waitFor(() => expect(queryByRole('tooltip')).not.toBeInTheDocument());
  });
});
