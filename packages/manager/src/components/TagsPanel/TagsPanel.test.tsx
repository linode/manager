import { fireEvent, queryByLabelText, waitFor } from '@testing-library/react';
import React from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { TagsPanel } from './TagsPanel';

vi.mock('src/queries/profile', () => ({
  useProfile: vi.fn(() => ({ data: { restricted: false } })),
}));

vi.mock('src/queries/tags', () => ({
  updateTagsSuggestionsData: vi.fn(),
  useTagSuggestions: vi.fn(() => ({ data: [], isLoading: false })),
}));

const queryClient = new QueryClient();

const renderWithQueryClient = (ui: any) => {
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

    // Click on the delete button for Tag1
    const deleteTagButton = getByLabelText("Delete Tag 'Tag1'");
    fireEvent.click(deleteTagButton);

    // Wait for the asynchronous updateTags to complete
    await waitFor(() => expect(updateTagsMock).toHaveBeenCalledWith(['Tag2']));

    // Check if Tag1 is removed
    expect(queryByLabelText("Search for Tag 'tag2'")).toBeNull();
  });
});
