import React from 'react';

import { stackScriptFactory } from 'src/factories';
import { makeResourcePage } from 'src/mocks/serverHandlers';
import { http, HttpResponse, server } from 'src/mocks/testServer';
import { renderWithThemeAndHookFormContext } from 'src/utilities/testHelpers';

import { StackScriptSelectionList } from './StackScriptSelectionList';

const queryMocks = vi.hoisted(() => ({
  useLocation: vi.fn(),
  useNavigate: vi.fn(),
  useParams: vi.fn(),
  useSearch: vi.fn(),
}));

vi.mock('@tanstack/react-router', async () => {
  const actual = await vi.importActual('@tanstack/react-router');
  return {
    ...actual,
    useLocation: queryMocks.useLocation,
    useNavigate: queryMocks.useNavigate,
    useSearch: queryMocks.useSearch,
    useParams: queryMocks.useParams,
  };
});

describe('StackScriptSelectionList', () => {
  beforeEach(() => {
    queryMocks.useLocation.mockReturnValue({
      pathname: '/linodes/create',
    });
    queryMocks.useNavigate.mockReturnValue(vi.fn());
    queryMocks.useSearch.mockReturnValue({});
    queryMocks.useParams.mockReturnValue({});
  });

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
      const item = await findByText(stackscript.label, { exact: false });

      expect(item).toBeVisible();
    }
  });

  it('renders and selected a StackScript from query params if one is specified', async () => {
    queryMocks.useSearch.mockReturnValue({
      stackScriptID: '921609',
    });
    const stackscript = stackScriptFactory.build();

    server.use(
      http.get('*/v4/linode/stackscripts/:id', () => {
        return HttpResponse.json(stackscript);
      })
    );

    const { findByLabelText, getByText } = renderWithThemeAndHookFormContext({
      component: <StackScriptSelectionList type="Account" />,
      options: {
        initialRoute: '/linodes/create/stackscripts',
        initialEntries: [
          '/linodes/create/stackscripts?subtype=Account&stackScriptID=921609',
        ],
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
