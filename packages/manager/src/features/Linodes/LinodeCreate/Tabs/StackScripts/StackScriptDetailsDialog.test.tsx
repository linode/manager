import React from 'react';

import { stackScriptFactory } from 'src/factories';
import { HttpResponse, http, server } from 'src/mocks/testServer';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { StackScriptDetailsDialog } from './StackScriptDetailsDialog';

describe('StackScriptDetailsDialog', () => {
  it('should render StackScript data from the API', async () => {
    const stackscript = stackScriptFactory.build({
      id: 1234,
      script: 'echo',
    });

    server.use(
      http.get('*/v4/linode/stackscripts/:id', () => {
        return HttpResponse.json(stackscript);
      })
    );

    const { findByText } = renderWithTheme(
      <StackScriptDetailsDialog
        id={stackscript.id}
        onClose={vi.fn()}
        open={true}
      />
    );

    await findByText(stackscript.id);
    await findByText(stackscript.label);
    await findByText(stackscript.username);
    await findByText(stackscript.description);
    await findByText(stackscript.script);
  });
});
