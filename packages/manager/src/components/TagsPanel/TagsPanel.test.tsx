import { fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { TagsPanel } from './TagsPanel';

import type { TagsPanelProps } from './TagsPanel';

const queryClient = new QueryClient();

const renderWithQueryClient = (ui: React.ReactElement<TagsPanelProps>) => {
  return renderWithTheme(
    <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>
  );
};

describe('TagsPanel', () => {
  it('renders TagsPanel component with existing tags', async () => {
    const updateTagsMock = vi.fn(() => Promise.resolve());

    const { getByLabelText, getByText } = renderWithQueryClient(
      <TagsPanel tags={['Tag1', 'Tag2']} updateTags={updateTagsMock} />
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

    const { getByLabelText, getByText } = renderWithQueryClient(
      <TagsPanel tags={['Tag1', 'Tag2']} updateTags={updateTagsMock} />
    );

    fireEvent.click(getByText('Add a tag'));

    fireEvent.change(getByLabelText('Create or Select a Tag'), {
      target: { value: 'NewTag' },
    });

    const newTagItem = getByText('Create "NewTag"');
    fireEvent.click(newTagItem);

    await waitFor(() => {
      expect(updateTagsMock).toHaveBeenCalledWith(['NewTag', 'Tag1', 'Tag2']);
    });
  });

  it('displays an error message for invalid tag creation', async () => {
    const updateTagsMock = vi.fn(() => Promise.resolve());

    const { getByLabelText, getByText } = renderWithQueryClient(
      <TagsPanel tags={['Tag1', 'Tag2']} updateTags={updateTagsMock} />
    );

    fireEvent.click(getByText('Add a tag'));

    fireEvent.change(getByLabelText('Create or Select a Tag'), {
      target: { value: 'yz' },
    });

    const newTagItem = getByText('Create "yz"');
    fireEvent.click(newTagItem);

    await waitFor(() =>
      expect(
        getByText('Tag "yz" length must be 3-50 characters')
      ).toBeInTheDocument()
    );
  });

  it('deletes a tag successfully', async () => {
    const updateTagsMock = vi.fn(() => Promise.resolve());

    const {
      getByLabelText,
      getByText,
      queryByLabelText,
    } = renderWithQueryClient(
      <TagsPanel tags={['Tag1', 'Tag2']} updateTags={updateTagsMock} />
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

    const { getByText, queryByLabelText, queryByText } = renderWithQueryClient(
      <TagsPanel disabled tags={['Tag1', 'Tag2']} updateTags={updateTagsMock} />
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
