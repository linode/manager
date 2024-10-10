import userEvent from '@testing-library/user-event';
import React from 'react';

import { stackScriptFactory } from 'src/factories';
import { renderWithTheme, wrapWithTableBody } from 'src/utilities/testHelpers';

import { StackScriptSelectionRow } from './StackScriptSelectionRow';

describe('StackScriptSelectionRow', () => {
  it('render a stackscript label and username', () => {
    const stackscript = stackScriptFactory.build();

    const { getByText } = renderWithTheme(
      wrapWithTableBody(
        <StackScriptSelectionRow
          isSelected={false}
          onOpenDetails={vi.fn()}
          onSelect={vi.fn()}
          stackscript={stackscript}
        />
      )
    );

    expect(getByText(stackscript.username, { exact: false })).toBeVisible();
    expect(getByText(stackscript.label, { exact: false })).toBeVisible();
  });

  it('render a checked Radio if isSelected is true', () => {
    const stackscript = stackScriptFactory.build();

    const { getByLabelText } = renderWithTheme(
      wrapWithTableBody(
        <StackScriptSelectionRow
          isSelected={true}
          onOpenDetails={vi.fn()}
          onSelect={vi.fn()}
          stackscript={stackscript}
        />
      )
    );

    const radio = getByLabelText(stackscript.label, { exact: false });

    expect(radio).toBeChecked();
  });

  it('render an unchecked Radio if isSelected is false', () => {
    const stackscript = stackScriptFactory.build();

    const { getByLabelText } = renderWithTheme(
      wrapWithTableBody(
        <StackScriptSelectionRow
          isSelected={false}
          onOpenDetails={vi.fn()}
          onSelect={vi.fn()}
          stackscript={stackscript}
        />
      )
    );

    const radio = getByLabelText(stackscript.label, { exact: false });

    expect(radio).not.toBeChecked();
  });

  it('should call onSelect when a stackscript is clicked', async () => {
    const stackscript = stackScriptFactory.build();
    const onSelect = vi.fn();

    const { getByLabelText } = renderWithTheme(
      wrapWithTableBody(
        <StackScriptSelectionRow
          isSelected={false}
          onOpenDetails={vi.fn()}
          onSelect={onSelect}
          stackscript={stackscript}
        />
      )
    );

    const radio = getByLabelText(stackscript.label, { exact: false });

    await userEvent.click(radio);

    expect(onSelect).toHaveBeenCalled();
  });

  it('should call onOpenDetails when a stackscript details button is clicked', async () => {
    const stackscript = stackScriptFactory.build();
    const onOpenDetails = vi.fn();

    const { getByText } = renderWithTheme(
      wrapWithTableBody(
        <StackScriptSelectionRow
          isSelected={false}
          onOpenDetails={onOpenDetails}
          onSelect={vi.fn()}
          stackscript={stackscript}
        />
      )
    );

    const detailsButton = getByText('Show Details');

    await userEvent.click(detailsButton);

    expect(onOpenDetails).toHaveBeenCalled();
  });
});
