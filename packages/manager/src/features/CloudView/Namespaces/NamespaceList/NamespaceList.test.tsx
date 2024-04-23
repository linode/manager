import { QueryClient } from '@tanstack/react-query';
import * as React from 'react';

import { namespaceFactory } from 'src/factories';
import { formatDate } from 'src/utilities/formatDate';
import { mockMatchMedia, renderWithTheme } from 'src/utilities/testHelpers';

import { NamespaceList } from './NamespaceList';

const queryClient = new QueryClient();
beforeAll(() => mockMatchMedia());
afterEach(() => {
  queryClient.clear();
});

describe('Namespaces List', () => {
  it('should render the Namespace Table with the columns', async () => {
    const { getByText } = renderWithTheme(
      <NamespaceList namespacesList={[]} />
    );

    getByText('Name');
    getByText('Data Type');
    getByText('Region');
    getByText('Creation Date (UTC)');
  });

  it('should render the Namespaces data', async () => {
    const namespaces = namespaceFactory.build();
    const { getByText } = renderWithTheme(
      <NamespaceList namespacesList={[namespaces]} />
    );

    getByText(namespaces.label);
    getByText(namespaces.type);
    getByText(namespaces.region);
    getByText(formatDate(namespaces.created));
  });
});
