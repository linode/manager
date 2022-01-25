import * as React from 'react';
import LinodeThemeWrapper from 'src/LinodeThemeWrapper';
import { renderWithTheme } from 'src/utilities/testHelpers';
import { fireEvent } from '@testing-library/react';

import AddNewMenu from './AddNewMenu';

describe('AddNewMenu', () => {
  it('should render without error', () => {
    renderWithTheme(
      <LinodeThemeWrapper theme="light">
        <AddNewMenu />
      </LinodeThemeWrapper>
    );
  });

  it('should have an entry for database', () => {
    const { getByText } = renderWithTheme(
      <LinodeThemeWrapper theme="light">
        <AddNewMenu />
      </LinodeThemeWrapper>,
      { flags: { databases: true } }
    );
    const createButton = getByText('Create');
    fireEvent.click(createButton);
    expect(getByText('Database')).not.toBe(undefined);
  });
});
