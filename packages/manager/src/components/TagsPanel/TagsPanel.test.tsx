import { fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { TagsPanel } from './TagsPanel';

const tagsPanelProps = {
  entityId: 123,
  tags: ['Tag1', 'Tag2'],
};

describe('TagsPanel', () => {
  it('renders TagsPanel component with existing tags', async () => {
    const updateTagsMock = vi.fn(() => Promise.resolve());

    const { getByLabelText, getByText } = renderWithTheme(
      <TagsPanel {...tagsPanelProps} updateTags={updateTagsMock} />
    );

    expect(getByText('Tag1')).toBeInTheDocument();
    expect(getByText('Tag2')).toBeInTheDocument();

    const addTagButton = getByText('Add a tag');
    expect(addTagButton).toBeInTheDocument();

    fireEvent.click(addTagButton);

    const tagInput = getByLabelText('Create or Select a Tag');
    expect(tagInput).toBeInTheDocument();
  });

  it('creates a new tag successfully', async () => {
    const updateTagsMock = vi.fn(() => Promise.resolve());

    const { getByLabelText, getByText } = renderWithTheme(
      <TagsPanel {...tagsPanelProps} updateTags={updateTagsMock} />
    );

    await userEvent.click(getByText('Add a tag'));

    fireEvent.change(getByLabelText('Create or Select a Tag'), {
      target: { value: 'NewTag' },
    });

    const newTagItem = getByText('Create "NewTag"');
    await userEvent.click(newTagItem);

    await waitFor(() => {
      expect(updateTagsMock).toHaveBeenCalledWith(['NewTag', 'Tag1', 'Tag2']);
    });
  });

  it('displays an error message for invalid tag creation', async () => {
    const updateTagsMock = vi.fn(() => Promise.resolve());

    const { getByLabelText, getByText } = renderWithTheme(
      <TagsPanel {...tagsPanelProps} updateTags={updateTagsMock} />
    );

    await userEvent.click(getByText('Add a tag'));

    fireEvent.change(getByLabelText('Create or Select a Tag'), {
      target: { value: 'yz' },
    });

    const newTagItem = getByText('Create "yz"');

    await userEvent.click(newTagItem);

    await waitFor(() =>
      expect(
        getByText('Tag "yz" length must be 3-50 characters')
      ).toBeInTheDocument()
    );
  });

  it('deletes a tag successfully', async () => {
    const updateTagsMock = vi.fn(() => Promise.resolve());

    const { getByLabelText, getByText, queryByLabelText } = renderWithTheme(
      <TagsPanel {...tagsPanelProps} updateTags={updateTagsMock} />
    );

    expect(getByText('Tag1')).toBeInTheDocument();
    expect(getByText('Tag2')).toBeInTheDocument();

    const deleteTagButton = getByLabelText("Delete Tag 'Tag1'");
    fireEvent.click(deleteTagButton);

    await waitFor(() => expect(updateTagsMock).toHaveBeenCalledWith(['Tag2']));

    expect(queryByLabelText("Search for Tag 'tag2'")).toBeNull();
  });

  it('prevents creation or deletion of tags when disabled', async () => {
    const updateTagsMock = vi.fn(() => Promise.resolve());

    const { getByText, queryByLabelText, queryByText } = renderWithTheme(
      <TagsPanel disabled {...tagsPanelProps} updateTags={updateTagsMock} />
    );

    expect(getByText('Tag1')).toBeInTheDocument();
    expect(getByText('Tag2')).toBeInTheDocument();

    const addTagButton = getByText('Add a tag');
    expect(addTagButton).toBeInTheDocument();

    fireEvent.click(addTagButton);

    const tagInput = queryByText('Create or Select a Tag');
    expect(tagInput).toBeNull();

    const deleteTagButton = queryByLabelText("Delete Tag 'Tag1'");
    expect(deleteTagButton).toBeNull();

    await waitFor(() => expect(updateTagsMock).not.toHaveBeenCalled());
  });
});
