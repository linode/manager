import { getStackScripts } from '@linode/api-v4';
import * as React from 'react';

import { stackScriptFactory } from 'src/factories';
import { makeResourcePage } from 'src/mocks/serverHandlers';
import { http, HttpResponse, server } from 'src/mocks/testServer';
import { renderWithTheme } from 'src/utilities/testHelpers';

import {
  CombinedProps,
  FromStackScriptContent,
} from './FromStackScriptContent';

const mockProps: CombinedProps = {
  accountBackupsEnabled: false,
  category: 'account',
  handleSelectUDFs: vi.fn(),
  header: '',
  imagesData: {},
  regionsData: [],
  request: getStackScripts,
  updateImageID: vi.fn(),
  updateRegionID: vi.fn(),
  updateStackScript: vi.fn(),
  updateTypeID: vi.fn(),
  userCannotCreateLinode: false,
};

describe('FromStackScriptContent', () => {
  it('should render stackscripts', async () => {
    const stackscripts = stackScriptFactory.buildList(3);

    server.use(
      http.get('*/v4/linode/stackscripts', () => {
        return HttpResponse.json(makeResourcePage(stackscripts));
      })
    );

    const { findByText } = renderWithTheme(
      <FromStackScriptContent {...mockProps} />
    );

    for (const stackscript of stackscripts) {
      // eslint-disable-next-line no-await-in-loop
      await findByText(stackscript.label);
    }
  });
});
