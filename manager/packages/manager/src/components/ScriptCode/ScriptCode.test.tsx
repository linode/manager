import * as React from 'react';
import { renderWithTheme } from 'src/utilities/testHelpers';
import { ScriptCode } from './ScriptCode';

describe('ScriptCode', () => {
  it('should render multiple lines of code if there are line breaks', () => {
    const { getAllByRole } = renderWithTheme(
      <ScriptCode
        script={
          'This is my custom script to display\nNew line\nAnother new line'
        }
      />
    );

    // Total row should be the lines of code + 1 to account for the empty row at the end
    expect(getAllByRole('row')).toHaveLength(4);
  });
});
