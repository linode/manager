import { fireEvent } from '@testing-library/react';
import * as React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';
import TagsInput from './TagsInput';

const request = require.requireMock('linode-js-sdk/lib/tags');

jest.mock('linode-js-sdk/lib/tags', () => ({
  getTags: jest.fn()
}));
jest.mock('src/components/EnhancedSelect/Select');

const mockTags = ['tag1', 'tag2', 'tag3', 'tag4', 'tag5'];

request.getTags = jest
  .fn()
  .mockResolvedValue({ data: mockTags.map(tag => ({ label: tag })) });

describe('TagsInput', () => {
  const onChange = jest.fn();

  const { getByTestId, queryAllByTestId } = renderWithTheme(
    <TagsInput
      value={'mockvalue' as any} // We're mocking this component so ignore the Props typing
      onChange={onChange}
    />
  );

  it('sets account tags based on API request', () => {
    fireEvent.click(getByTestId('select'));
    expect(queryAllByTestId('mock-option')).toHaveLength(mockTags.length);
    expect(request.getTags).toHaveBeenCalledTimes(1);
  });

  it('calls onChange handler when the value is updated', () => {
    fireEvent.change(getByTestId('select'), {
      target: { value: 'tag2' }
    });
    expect(onChange).toHaveBeenCalledWith([{ label: 'tag2', value: 'tag2' }]);
  });
});
