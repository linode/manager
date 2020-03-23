import { render } from '@testing-library/react';
import * as React from 'react';

import { normalizedImages } from 'src/__data__/images';
import { reactRouterProps } from 'src/__data__/reactRouterProps';
import { wrapWithTheme } from 'src/utilities/testHelpers';
import { StackScriptsLanding } from './StackScriptsLanding';

describe('StackScripts Landing', () => {
  const { getByText } = render(
    wrapWithTheme(
      <StackScriptsLanding
        imagesData={normalizedImages}
        imagesLoading={false}
        imagesError={{}}
        {...reactRouterProps}
      />
    )
  );

  it('icon text link text should read "Create New StackScript"', () => {
    getByText(/create new stackscript/i);
  });
});
