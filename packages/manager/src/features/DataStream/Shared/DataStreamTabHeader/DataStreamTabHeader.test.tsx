import * as React from 'react';

import { DataStreamTabHeader } from 'src/features/DataStream/Shared/DataStreamTabHeader/DataStreamTabHeader';
import { streamStatusOptions } from 'src/features/DataStream/Shared/types';
import { renderWithTheme } from 'src/utilities/testHelpers';

describe('DataStreamTabHeader', () => {
  it('should render a create button', () => {
    const { getByText } = renderWithTheme(
      <DataStreamTabHeader entity="Stream" onButtonClick={() => null} />
    );

    getByText('Create Stream');
  });

  it('should render a disabled create button', () => {
    const { getByText } = renderWithTheme(
      <DataStreamTabHeader
        disabledCreateButton
        entity="Stream"
        onButtonClick={() => null}
      />
    );

    expect(getByText('Create Stream').closest('button')).toHaveAttribute(
      'aria-disabled',
      'true'
    );
  });

  it('should render a search input', () => {
    const { getByPlaceholderText } = renderWithTheme(
      <DataStreamTabHeader
        entity="Stream"
        isSearching={false}
        onButtonClick={() => null}
        onSearch={() => null}
        searchValue={''}
      />
    );

    getByPlaceholderText('Search for a Stream');
  });

  it('should render a select input', () => {
    const selectValue = streamStatusOptions[0].value;
    const { getByPlaceholderText, getByLabelText } = renderWithTheme(
      <DataStreamTabHeader
        entity="Stream"
        onSelect={() => null}
        selectList={streamStatusOptions}
        selectValue={selectValue}
      />
    );

    getByLabelText('Status');
    getByPlaceholderText('Select');
  });
});
