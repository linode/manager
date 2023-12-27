import * as React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { ModeSelect } from './ModeSelect';

const modes = [
  {
    label: 'Edit',
    mode: 'edit',
  },
  {
    label: 'Delete',
    mode: 'delete',
  },
];

const props = {
  modes,
  onChange: vi.fn(),
  selected: 'edit',
};

describe('ModeSelect', () => {
  it('should render Mode labels', () => {
    const { getByText } = renderWithTheme(<ModeSelect {...props} />);

    for (const mode of modes) {
      expect(getByText(mode.label)).toBeVisible();
    }
  });
  it('should render one radio for each mode option', () => {
    const { getAllByRole } = renderWithTheme(<ModeSelect {...props} />);

    expect(getAllByRole('radio')).toHaveLength(modes.length);
  });
  it('should render one radio group', () => {
    const { getAllByRole } = renderWithTheme(<ModeSelect {...props} />);

    expect(getAllByRole('radiogroup')).toHaveLength(1);
  });
});
