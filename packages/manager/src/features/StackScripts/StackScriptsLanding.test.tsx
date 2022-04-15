import { render } from '@testing-library/react';
import * as React from 'react';
import { imageFactory, normalizeEntities } from 'src/factories';
import { reactRouterProps } from 'src/__data__/reactRouterProps';
import { wrapWithTheme } from 'src/utilities/testHelpers';
import { StackScriptsLanding } from './StackScriptsLanding';

describe.skip('StackScripts Landing', () => {
  const normalizedImages = normalizeEntities(imageFactory.buildList(10));

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
