import { Box } from '@linode/ui';
import * as React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import PromiseLoader from './PromiseLoader';

describe('PromiseLoaderSpec', () => {
  it('shows a loading state initially and the component afterwards', async () => {
    const ExampleComponent = () => <Box>Hey</Box>;

    const examplePromise = async () => {
      await new Promise((r) => setTimeout(r, 100));
      return 'OMG!';
    };

    const Component = PromiseLoader({ data: examplePromise })(ExampleComponent);

    const { findByText, getByTestId } = renderWithTheme(<Component />);

    expect(getByTestId('circle-progress')).toBeVisible();

    await findByText('Hey');
  });
});
