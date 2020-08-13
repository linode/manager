import * as tags from '@linode/api-v4/lib/tags/tags';
import { fireEvent, waitFor } from '@testing-library/react';
import * as React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';
import TagsInput from './TagsInput';

jest.mock('src/components/EnhancedSelect/Select');
const mockGetTags = jest.spyOn<any, any>(tags, 'getTags');

describe('TagsInput', () => {
  const onChange = jest.fn();

  const { getByTestId, queryAllByTestId } = renderWithTheme(
    <TagsInput
      value={'mockvalue' as any} // We're mocking this component so ignore the Props typing
      onChange={onChange}
    />
  );

  it('sets account tags based on API request', async () => {
    fireEvent.click(getByTestId('select'));
    await waitFor(() =>
      expect(queryAllByTestId('mock-option')).toHaveLength(5)
    );
    await waitFor(() => expect(mockGetTags).toHaveBeenCalledTimes(1));
  });

  it('calls onChange handler when the value is updated', async () => {
    fireEvent.change(getByTestId('select'), {
      target: { value: 'tag-2' }
    });
    await waitFor(() =>
      expect(onChange).toHaveBeenCalledWith([
        { label: 'tag-2', value: 'tag-2' }
      ])
    );
  });
});
