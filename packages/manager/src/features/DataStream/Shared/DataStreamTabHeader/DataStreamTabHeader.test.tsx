import * as React from 'react';

import { DataStreamTabHeader } from 'src/features/DataStream/Shared/DataStreamTabHeader/DataStreamTabHeader';
import { renderWithTheme } from 'src/utilities/testHelpers';

describe('DataStreamTabHeader', () => {
  it('should render a create button', () => {
    const { getByText } = renderWithTheme(
      <DataStreamTabHeader entity="Stream" onButtonClick={() => null} />
    );
    expect(getByText('Create Stream')).toBeInTheDocument();
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
});
