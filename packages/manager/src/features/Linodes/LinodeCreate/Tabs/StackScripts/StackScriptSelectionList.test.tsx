import React from 'react';

import { stackScriptFactory } from 'src/factories';
import { makeResourcePage } from 'src/mocks/serverHandlers';
import { http, HttpResponse, server } from 'src/mocks/testServer';
import { renderWithThemeAndHookFormContext } from 'src/utilities/testHelpers';

import { StackScriptSelectionList } from './StackScriptSelectionList';

describe('StackScriptSelectionList', () => {
  it('renders StackScripts returned by the API', async () => {
    const stackscripts = stackScriptFactory.buildList(5);

    server.use(
      http.get('*/v4/linode/stackscripts', () => {
        return HttpResponse.json(makeResourcePage(stackscripts));
      })
    );

    const { findByText } = renderWithThemeAndHookFormContext({
      component: <StackScriptSelectionList type="Account" />,
    });

    for (const stackscript of stackscripts) {
      // eslint-disable-next-line no-await-in-loop
      const item = await findByText(stackscript.label, { exact: false });

      expect(item).toBeVisible();
    }
  });

  it('renders and selected a StackScript from query params if one is specified', async () => {
    const stackscript = stackScriptFactory.build();

    server.use(
      http.get('*/v4/linode/stackscripts/:id', () => {
        return HttpResponse.json(stackscript);
      })
    );

    const { findByLabelText, getByText } = renderWithThemeAndHookFormContext({
      component: <StackScriptSelectionList type="Account" />,
      options: {
        MemoryRouter: {
          initialEntries: [
            '/linodes/create?type=StackScripts&subtype=Account&stackScriptID=921609',
          ],
        },
      },
    });

    const stackscriptItem = await findByLabelText(stackscript.label, {
      exact: false,
    });

    expect(stackscriptItem).toBeInTheDocument();

    expect(getByText('Choose Another StackScript')).toBeVisible();
  });

  it('checks the selected StackScripts Radio if it is clicked', async () => {
    const stackscripts = stackScriptFactory.buildList(5);

    const selectedStackScript = stackscripts[2];

    server.use(
      http.get('*/v4/linode/stackscripts', () => {
        return HttpResponse.json(makeResourcePage(stackscripts));
      })
    );

    const { findByLabelText } = renderWithThemeAndHookFormContext({
      component: <StackScriptSelectionList type="Account" />,
      useFormOptions: {
        defaultValues: { stackscript_id: selectedStackScript.id },
      },
    });

    const selectedStackScriptRadio = await findByLabelText(
      selectedStackScript.label,
      {
        exact: false,
      }
    );

    expect(selectedStackScriptRadio).toBeChecked();
  });
});
