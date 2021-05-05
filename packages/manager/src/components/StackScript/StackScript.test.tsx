import { screen } from '@testing-library/react';
import * as React from 'react';
import { stackScriptFactory } from 'src/factories/stackscripts';
import { renderWithTheme } from 'src/utilities/testHelpers';
import { SStackScript } from './StackScript';

describe('StackScript', () => {
  it('should render the StackScript label, id, and username', () => {
    const stackScript = stackScriptFactory.build();
    renderWithTheme(<SStackScript data={stackScript} userCanModify />);

    expect(screen.getByText(stackScript.label)).toBeInTheDocument();
    expect(screen.getByText(stackScript.username)).toBeInTheDocument();
    expect(screen.getByText(String(stackScript.id))).toBeInTheDocument();
  });
});
