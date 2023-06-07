import * as React from 'react';
import LinodeThemeWrapper from 'src/LinodeThemeWrapper';
import { renderWithTheme } from 'src/utilities/testHelpers';
import { AddNewMenu } from './AddNewMenu';

describe('AddNewMenu', () => {
  it('should render without error', () => {
    renderWithTheme(
      <LinodeThemeWrapper>
        <AddNewMenu />
      </LinodeThemeWrapper>
    );
  });
});
