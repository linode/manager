import * as tags from '@linode/api-v4/lib/tags/tags';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { TagsInput } from './TagsInput';

const mockGetTags = vi.spyOn<any, any>(tags, 'getTags').mockResolvedValue({
  data: [
    { label: 'tag-1', value: 'tag-1' },
    { label: 'tag-2', value: 'tag-2' },
    { label: 'tag-3', value: 'tag-3' },
    { label: 'tag-4', value: 'tag-4' },
    { label: 'tag-5', value: 'tag-5' },
  ],
});

describe('TagsInput', () => {
  const onChange = vi.fn();

  it('sets account tags based on API request', async () => {
    renderWithTheme(
      <TagsInput
        onChange={onChange}
        value={[{ label: 'mockValue', value: 'mockValue' }]}
      />
    );

    userEvent.click(screen.getByRole('combobox'));

    await waitFor(() => expect(screen.getAllByText(/tag-/i)).toHaveLength(5));
    await waitFor(() => expect(mockGetTags).toHaveBeenCalledTimes(1));
  });

  it('calls onChange handler when the value is updated', async () => {
    renderWithTheme(
      <TagsInput
        onChange={onChange}
        value={[{ label: 'mockValue', value: 'mockValue' }]}
      />
    );

    const input = screen.getByRole('combobox');

    // Typing 'new-tag' in the input field
    userEvent.type(input, 'new-tag');

    await waitFor(() => expect(input).toHaveValue('new-tag'));

    const createOption = screen.getByText('Create "new-tag"');

    // Click 'Create "new-tag"' option to create a new-tag
    userEvent.click(createOption);

    // Wait for the onChange to be called with the updated value
    await waitFor(() =>
      expect(onChange).toHaveBeenCalledWith([
        { label: 'mockValue', value: 'mockValue' },
        { label: 'new-tag', value: 'new-tag' },
      ])
    );
  });

  it('validates the input tag when the tag is empty', async () => {
    const onChangeMock = vi.fn();

    renderWithTheme(<TagsInput onChange={onChangeMock} value={[]} />);

    const input = screen.getByRole('combobox');

    await userEvent.type(input, ' ');

    const createOption = screen.getByText('Create " "');
    userEvent.click(createOption);

    await waitFor(() => {
      expect(screen.getByText('Tag cannot be an empty')).toBeInTheDocument();
    });
  });

  it('validates the input tag when the tag length is between 1 and 50 characters', async () => {
    const onChangeMock = vi.fn();

    renderWithTheme(<TagsInput onChange={onChangeMock} value={[]} />);

    const input = screen.getByRole('combobox');

    await userEvent.type(input, 'Ta');

    const createOption = screen.getByText('Create "Ta"');
    userEvent.click(createOption);

    expect(
      screen.queryByText('Length must be 1-50 characters')
    ).not.toBeInTheDocument();

    await waitFor(() =>
      expect(onChangeMock).toHaveBeenCalledWith([{ label: 'Ta', value: 'Ta' }])
    );
  });
});
