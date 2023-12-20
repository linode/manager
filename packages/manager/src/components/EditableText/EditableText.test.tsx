import { fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { EditableText } from './EditableText';

const props = {
  onCancel: vi.fn(),
  onEdit: vi.fn(() => Promise.resolve()),
  text: 'Edit this',
};

const BUTTON_LABEL = 'Edit Edit this';

describe('Editable Text', () => {
  it('renders an Editable Text input', () => {
    const { getByLabelText, getByText } = renderWithTheme(
      <EditableText {...props} />
    );

    const text = getByText('Edit this');
    expect(text).toBeVisible();
    const button = getByLabelText(BUTTON_LABEL);
    expect(button).toBeInTheDocument();
  });

  it('shows error text', () => {
    const { getByText } = renderWithTheme(
      <EditableText {...props} errorText="this is an error" />
    );

    const errorText = getByText('this is an error');
    expect(errorText).toBeVisible();
  });

  it('can switch between a label and a textfield', () => {
    const { getByLabelText, getByTestId, queryByTestId } = renderWithTheme(
      <EditableText {...props} />
    );

    const button = getByLabelText(BUTTON_LABEL);
    expect(button).toBeInTheDocument();

    fireEvent.click(button);
    expect(button).not.toBeInTheDocument();
    const textfield = getByTestId('textfield-input');
    expect(textfield).toHaveValue('Edit this');
    const saveButton = getByTestId('CheckIcon');
    expect(saveButton).toBeVisible();
    const closeButton = getByTestId('CloseIcon');
    expect(closeButton).toBeVisible();
    fireEvent.click(closeButton);
    expect(props.onCancel).toHaveBeenCalled();

    // after clicking the cancel icon
    const closeButtonAfter = queryByTestId('CloseIcon');
    expect(closeButtonAfter).not.toBeInTheDocument();
    const saveButtonAfter = queryByTestId('CheckIcon');
    expect(saveButtonAfter).not.toBeInTheDocument();
    const editButton2 = getByLabelText(BUTTON_LABEL);
    expect(editButton2).toBeInTheDocument();
  });

  it('does not call onEdit if there are no changes to the text', () => {
    const { getByLabelText, getByTestId, queryByTestId } = renderWithTheme(
      <EditableText {...props} />
    );
    const button = getByLabelText(BUTTON_LABEL);
    expect(button).toBeInTheDocument();

    fireEvent.click(button);
    const saveButton = getByTestId('CheckIcon');
    expect(saveButton).toBeVisible();
    fireEvent.click(saveButton);
    expect(props.onEdit).not.toHaveBeenCalled();

    // after clicking the save button
    const closeButtonAfter = queryByTestId('CloseIcon');
    expect(closeButtonAfter).not.toBeInTheDocument();
    const saveButtonAfter = queryByTestId('CheckIcon');
    expect(saveButtonAfter).not.toBeInTheDocument();
    const editButton2 = getByLabelText(BUTTON_LABEL);
    expect(editButton2).toBeInTheDocument();
  });

  it('calls onEdit if the text has been changed', () => {
    const { getByLabelText, getByTestId } = renderWithTheme(
      <EditableText {...props} />
    );
    const button = getByLabelText(BUTTON_LABEL);
    expect(button).toBeInTheDocument();

    fireEvent.click(button);
    const saveButton = getByTestId('CheckIcon');
    expect(saveButton).toBeVisible();

    // editing text
    const textfield = getByTestId('textfield-input');
    expect(textfield).toHaveValue('Edit this');
    userEvent.type(textfield, ' has now been edited');
    expect(textfield).toHaveValue('Edit this has now been edited');

    // saving text
    fireEvent.click(saveButton);
    expect(props.onEdit).toHaveBeenCalled();
  });
});
