import { fireEvent } from '@testing-library/react';
import * as React from 'react';

import { Radio } from './Radio';
import { renderWithTheme } from '../../utilities/testHelpers';
import { expect } from 'vitest';

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
