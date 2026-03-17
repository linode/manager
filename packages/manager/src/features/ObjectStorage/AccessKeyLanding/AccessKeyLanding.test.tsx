import * as React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { AccessKeyLanding } from './AccessKeyLanding';

describe('AccessKeyLanding', () => {
  it('should render a table of access keys', async () => {
    const { getByTestId } = renderWithTheme(<AccessKeyLanding />);
    expect(getByTestId('data-qa-access-key-table')).toBeInTheDocument();
  });
});
