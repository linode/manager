import * as React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { AccessKeyList } from './AccessKeyList';

const props = {
  isRestrictedUser: false,
};

describe('AccessKeyList', () => {
  it('should render a table of access keys', async () => {
    const { getByTestId } = renderWithTheme(<AccessKeyList {...props} />);
    expect(getByTestId('data-qa-access-key-table')).toBeInTheDocument();
  });
});
