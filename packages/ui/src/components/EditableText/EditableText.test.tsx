import { fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';
import { describe, expect, it, vi } from 'vitest';

import { renderWithTheme } from '../../utilities/testHelpers';
import { EditableText } from './EditableText';

const props = {
  onCancel: vi.fn(),
  onEdit: vi.fn(() => Promise.resolve()),
  text: 'Edit this',
};

const BUTTON_LABEL = 'Edit Edit this';
const CLOSE_BUTTON_ICON = 'CloseIcon';
const SAVE_BUTTON_ICON = 'CheckIcon';

describe('Editable Text', () => {
  it('renders an Editable Text input', () => {
    const { getByLabelText, getByText } = renderWithTheme(
      <EditableText {...props} />,
    );

    const text = getByText('Edit this');
    expect(text).toBeVisible();

    const button = getByLabelText(BUTTON_LABEL);
    expect(button).toBeInTheDocument();
  });

  it('shows error text', () => {
    const { getByText } = renderWithTheme(
      <EditableText {...props} errorText="this is an error" />,
    );

    const errorText = getByText('this is an error');
    expect(errorText).toBeVisible();
  });

  it('can switch between a label and a textfield', () => {
    const { getByLabelText, getByTestId, queryByTestId } = renderWithTheme(
      <EditableText {...props} />,
    );

    const button = getByLabelText(BUTTON_LABEL);
    expect(button).toBeInTheDocument();

    fireEvent.click(button);
    expect(button).not.toBeInTheDocument();

    const textfield = getByTestId('textfield-input');
    const saveButton = getByTestId(SAVE_BUTTON_ICON);
    const closeButton = getByTestId(CLOSE_BUTTON_ICON);

    expect(textfield).toHaveValue('Edit this');
    expect(saveButton).toBeVisible();
    expect(closeButton).toBeVisible();

    fireEvent.click(closeButton);
    expect(props.onCancel).toHaveBeenCalled();

    // after clicking the cancel icon
    expect(queryByTestId(CLOSE_BUTTON_ICON)).not.toBeInTheDocument();
    expect(queryByTestId(SAVE_BUTTON_ICON)).not.toBeInTheDocument();
    expect(getByLabelText(BUTTON_LABEL)).toBeInTheDocument();
  });

  it('does not call onEdit if there are no changes to the text', () => {
    const { getByLabelText, getByTestId, queryByTestId } = renderWithTheme(
      <EditableText {...props} />,
    );
    const button = getByLabelText(BUTTON_LABEL);
    expect(button).toBeInTheDocument();

    fireEvent.click(button);

    const saveButton = getByTestId(SAVE_BUTTON_ICON);
    expect(saveButton).toBeVisible();
    fireEvent.click(saveButton);
    expect(props.onEdit).not.toHaveBeenCalled();

    // after clicking the save button
    expect(queryByTestId(CLOSE_BUTTON_ICON)).not.toBeInTheDocument();
    expect(queryByTestId(SAVE_BUTTON_ICON)).not.toBeInTheDocument();
    expect(getByLabelText(BUTTON_LABEL)).toBeInTheDocument();
  });

  it('calls onEdit if the text has been changed', async () => {
    const { getByLabelText, getByTestId } = renderWithTheme(
      <EditableText {...props} />,
    );
    const button = getByLabelText(BUTTON_LABEL);
    expect(button).toBeInTheDocument();

    fireEvent.click(button);

    const saveButton = getByTestId(SAVE_BUTTON_ICON);
    expect(saveButton).toBeVisible();

    // editing text
    const textfield = getByTestId('textfield-input');
    expect(textfield).toHaveValue('Edit this');
    await userEvent.type(textfield, ' has now been edited');
    expect(textfield).toHaveValue('Edit this has now been edited');

    // saving text
    fireEvent.click(saveButton);
    expect(props.onEdit).toHaveBeenCalled();
  });

  it('appends a suffix to the text when provided', () => {
    const { getByRole, getByTestId, getByText } = renderWithTheme(
      <EditableText {...props} textSuffix=" suffix" />,
    );

    const text = getByText('Edit this suffix');
    expect(text).toBeVisible();

    const editButton = getByRole('button', { name: BUTTON_LABEL });
    expect(editButton).toBeInTheDocument();

    fireEvent.click(editButton);
    const textfield = getByTestId('textfield-input');

    expect(textfield).toHaveValue('Edit this');

    const closeButton = getByTestId(CLOSE_BUTTON_ICON);
    fireEvent.click(closeButton);

    expect(getByText('Edit this suffix')).toBeVisible();
  });
});
