import * as React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { LabelAndTagsPanel } from './LabelAndTagsPanel';

const onLabelChange = vi.fn();
const onTagsChange = vi.fn();
const INPUT_LABEL = 'Linode Label';
const TAG_LABEL = 'Custom Label';

describe('Tags list', () => {
  it('should render tags input if tagsInputProps are specified', () => {
    const { getByLabelText, queryByText } = renderWithTheme(
      <LabelAndTagsPanel
        labelFieldProps={{
          label: INPUT_LABEL,
          onChange: onLabelChange,
          value: '',
        }}
        tagsInputProps={{
          label: TAG_LABEL,
          onChange: onTagsChange,
          value: ['tag1', 'tag2'].map((tag) => ({ label: tag, value: tag })),
        }}
      />
    );

    expect(getByLabelText(TAG_LABEL)).toBeInTheDocument();
    expect(queryByText('tag1')).toBeInTheDocument();
    expect(queryByText('tag2')).toBeInTheDocument();
  });

  it('should render error text if errorText or tagError is specified', () => {
    const { getByText } = renderWithTheme(
      <LabelAndTagsPanel
        labelFieldProps={{
          errorText: 'Your label is rude!',
          label: INPUT_LABEL,
          onChange: onLabelChange,
          value: '',
        }}
        tagsInputProps={{
          label: TAG_LABEL,
          onChange: onTagsChange,
          tagError: 'Tag names are too short!',
          value: ['a', 'b'].map((tag) => ({
            label: tag,
            value: tag,
          })),
        }}
      />
    );

    expect(getByText('Your label is rude!')).toBeInTheDocument();
    expect(getByText('Tag names are too short!')).toBeInTheDocument();
  });

  it('should NOT render tags input if tagsInputProps are NOT specified', () => {
    const { queryByLabelText } = renderWithTheme(
      <LabelAndTagsPanel
        labelFieldProps={{
          label: INPUT_LABEL,
          onChange: onLabelChange,
          value: '',
        }}
      />
    );
    expect(queryByLabelText(TAG_LABEL)).not.toBeInTheDocument();
  });
});
