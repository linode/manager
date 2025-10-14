import * as React from 'react';

import { DeliveryTabHeader } from 'src/features/Delivery/Shared/DeliveryTabHeader/DeliveryTabHeader';
import { streamStatusOptions } from 'src/features/Delivery/Shared/types';
import { renderWithTheme } from 'src/utilities/testHelpers';

describe('DeliveryTabHeader', () => {
  it('should render a create button', () => {
    const { getByText } = renderWithTheme(
      <DeliveryTabHeader entity="Stream" onButtonClick={() => null} />
    );

    getByText('Create Stream');
  });

  it('should render a disabled create button', () => {
    const { getByText } = renderWithTheme(
      <DeliveryTabHeader
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
      <DeliveryTabHeader
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
      <DeliveryTabHeader
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
