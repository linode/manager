import { render } from '@testing-library/react';
import * as React from 'react';

import { imageFactory, normalizeEntities } from 'src/factories';
import { reactRouterProps } from 'src/__data__/reactRouterProps';
import { wrapWithTheme } from 'src/utilities/testHelpers';
import { StackScriptsLanding } from './StackScriptsLanding';

jest.mock('src/hooks/useReduxLoad', () => ({
  useReduxLoad: jest.fn().mockReturnValue({ _loading: false }),
}));

jest.mock('@linode/api-v4/lib/account', () => ({
  getUsers: jest.fn().mockResolvedValue({}),
}));

const normalizedImages = normalizeEntities(imageFactory.buildList(10));

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

  it('icon text link text should read "Create StackScript"', () => {
    getByText(/create stackscript/i);
  });
});
