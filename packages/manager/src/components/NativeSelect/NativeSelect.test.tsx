import * as React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import NativeSelect from './NativeSelect';

describe('Native Select', () => {
  it('should always have render label', () => {
    const { queryByTestId } = renderWithTheme(<NativeSelect label="test" />);
    expect(queryByTestId('native-select')).toBeInTheDocument();
    expect(queryByTestId('native-select-label')).toHaveTextContent('test');
  });

  it('should always have an ID based on label', () => {
    const { queryByTestId } = renderWithTheme(
      <NativeSelect label="test" />
    ) as any;
    expect(queryByTestId('native-select').firstChild).toHaveAttribute(
      'id',
      'test'
    );
  });
});
