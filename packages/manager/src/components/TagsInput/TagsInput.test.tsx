import * as tags from '@linode/api-v4/lib/tags/tags';
import { fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { TagsInput } from './TagsInput';

vi.mock('src/components/EnhancedSelect/Select');
const mockGetTags = vi.spyOn<any, any>(tags, 'getTags');

describe('TagsInput', () => {
  const onChange = vi.fn();

  it('sets account tags based on API request', async () => {
    const { getByTestId, queryAllByTestId } = renderWithTheme(
      <TagsInput
        onChange={onChange}
        value={['mockvalue'] as any} // We're mocking this component so ignore the Props typing
      />
    );
    fireEvent.click(getByTestId('select'));
    await waitFor(() =>
      expect(queryAllByTestId('mock-option')).toHaveLength(5)
    );
    await waitFor(() => expect(mockGetTags).toHaveBeenCalledTimes(1));
  });

  it('calls onChange handler when the value is updated', async () => {
    const { findByTestId, queryAllByTestId } = renderWithTheme(
      <TagsInput
        onChange={onChange}
        value={['mockvalue'] as any} // We're mocking this component so ignore the Props typing
      />
    );
    await waitFor(() =>
      expect(queryAllByTestId('mock-option')).toHaveLength(5)
    );

    userEvent.selectOptions(await findByTestId('select'), 'tag-2');

    await waitFor(() =>
      expect(onChange).toHaveBeenCalledWith([
        { label: 'tag-2', value: 'tag-2' },
      ])
    );
  });
});
