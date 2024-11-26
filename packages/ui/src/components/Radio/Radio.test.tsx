import { fireEvent } from '@testing-library/react';
import * as React from 'react';
import { describe, expect, it } from 'vitest';

import { renderWithTheme } from '../../utilities/testHelpers';
import { Radio } from './Radio';

// This test is for a single radio button, not a radio group
describe('Radio', () => {
  it('renders a single radio properly', () => {
    const screen = renderWithTheme(<Radio />);

    const radio = screen.getByRole('radio');
    expect(radio).toBeInTheDocument();
    const notFilled = screen.container.querySelector('[id="Oval-2"]');
    expect(notFilled).not.toBeInTheDocument();
    fireEvent.click(radio);
    const filled = screen.container.querySelector('[id="Oval-2"]');
    expect(filled).toBeInTheDocument();
  });

  it('can render a disabled radio', () => {
    const screen = renderWithTheme(<Radio disabled={true} />);
    const disabled = screen.container.querySelector('[aria-disabled="true"]');
    expect(disabled).toBeInTheDocument();
  });
});
