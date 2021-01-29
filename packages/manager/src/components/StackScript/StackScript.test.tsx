import { screen } from '@testing-library/react';
import * as React from 'react';
import { stackScriptFactory } from 'src/factories/stackscripts';
import { renderWithTheme } from 'src/utilities/testHelpers';
import { SStackScript } from './StackScript';
import { history, match, mockLocation } from 'src/__data__/reactRouterProps';

describe('StackScript', () => {
  it('should render the StackScript label, id, and username', () => {
    const stackScript = stackScriptFactory.build();
    renderWithTheme(
      <SStackScript
        data={stackScript}
        isRestrictedUser={false}
        stackScriptGrants={[]}
        history={history}
        location={mockLocation}
        match={match}
      />
    );

    expect(screen.getByText(stackScript.label)).toBeInTheDocument();
    expect(screen.getByText(stackScript.username)).toBeInTheDocument();
    expect(screen.getByText(String(stackScript.id))).toBeInTheDocument();
  });
});
