import { render } from '@testing-library/react';
import * as React from 'react';

import { normalizedImages } from 'src/__data__/images';
import { reactRouterProps } from 'src/__data__/reactRouterProps';
import { wrapWithTheme } from 'src/utilities/testHelpers';
import { StackScriptsLanding } from './StackScriptsLanding';

jest.mock('src/hooks/useReduxLoad', () => ({
  useReduxLoad: jest.fn().mockReturnValue({ _loading: false })
}));

jest.mock('@linode/api-v4/lib/account', () => ({
  getUsers: jest.fn().mockResolvedValue({})
}));

describe('StackScripts Landing', () => {
  const { getByText } = render(
    wrapWithTheme(
      <StackScriptsLanding
        imagesData={normalizedImages}
        imagesLoading={false}
        imagesError={{}}
        imagesLastUpdated={0}
        {...reactRouterProps}
      />
    )
  );

  it.skip('icon text link text should read "Create New StackScript"', () => {
    getByText(/create new stackscript/i);
  });
});
