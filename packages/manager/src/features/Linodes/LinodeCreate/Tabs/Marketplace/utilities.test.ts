import { renderHook, waitFor } from '@testing-library/react';

import { stackScriptFactory } from 'src/factories';
import { oneClickApps } from 'src/features/OneClickApps/oneClickApps';
import { makeResourcePage } from 'src/mocks/serverHandlers';
import { HttpResponse, http, server } from 'src/mocks/testServer';
import { wrapWithTheme } from 'src/utilities/testHelpers';

import { getFilteredApps, useMarketplaceApps } from './utilities';

import type { MarketplaceApp } from './utilities';

const mysql = {
  details: oneClickApps[607026],
  stackscript: stackScriptFactory.build({ id: 607026, label: 'MySQL' }),
};

const piHole = {
  details: oneClickApps[970522],
  stackscript: stackScriptFactory.build({ id: 970522, label: 'Pi-Hole' }),
};

const vault = {
  details: oneClickApps[1037038],
  stackscript: stackScriptFactory.build({ id: 1037038, label: 'Vault' }),
};

const apps: MarketplaceApp[] = [mysql, piHole, vault];

describe('getFilteredApps', () => {
  it('should not perform any filtering if the search is empty', () => {
    const result = getFilteredApps({
      apps,
      category: undefined,
      query: '',
    });

    expect(result).toStrictEqual(apps);
  });

  it('should allow a simple filter on label', () => {
    const result = getFilteredApps({
      apps,
      category: undefined,
      query: 'mysql',
    });

    expect(result).toStrictEqual([mysql]);
  });

  it('should allow a filter on label and catergory', () => {
    const result = getFilteredApps({
      apps,
      category: undefined,
      query: 'mysql, database',
    });

    expect(result).toStrictEqual([mysql]);
  });

  it('should allow filtering on StackScript id', () => {
    const result = getFilteredApps({
      apps,
      category: undefined,
      query: '1037038',
    });

    expect(result).toStrictEqual([vault]);
  });

  it('should allow filtering on alt description with many words', () => {
    const result = getFilteredApps({
      apps,
      category: undefined,
      query: 'HashiCorp password',
    });

    expect(result).toStrictEqual([vault]);
  });

  it('should filter if a category is selected in the category dropdown', () => {
    const result = getFilteredApps({
      apps,
      category: 'Databases',
      query: '',
    });

    expect(result).toStrictEqual([mysql]);
  });

  it('should allow searching by both a query and a category', () => {
    const result = getFilteredApps({
      apps,
      category: 'Databases',
      query: 'My',
    });

    expect(result).toStrictEqual([mysql]);
  });

  it('should return no matches if there are no results when searching by both query and category', () => {
    const result = getFilteredApps({
      apps,
      category: 'Databases',
      query: 'HashiCorp',
    });

    expect(result).toStrictEqual([]);
  });
});

describe('useMarketplaceApps', () => {
  it('should return apps from the stackscripts response', async () => {
    const stackscript = stackScriptFactory.build({
      id: 401697,
      label: 'Linode Marketplace App',
    });

    server.use(
      http.get('*/v4/linode/stackscripts', () => {
        return HttpResponse.json(makeResourcePage([stackscript]));
      })
    );

    const { result } = renderHook(() => useMarketplaceApps(), {
      wrapper: (ui) =>
        wrapWithTheme(ui, { flags: { marketplaceAppOverrides: [] } }),
    });

    await waitFor(() => {
      expect(result.current.apps).toStrictEqual([
        {
          details: oneClickApps[401697],
          stackscript,
        },
      ]);
    });
  });

  it('should override app details with the marketplaceAppOverrides feature flag', async () => {
    const stackscript = stackScriptFactory.build({
      id: 0,
      label: 'Linode Marketplace App',
    });

    server.use(
      http.get('*/v4/linode/stackscripts', () => {
        return HttpResponse.json(makeResourcePage([stackscript]));
      })
    );

    const { result } = renderHook(() => useMarketplaceApps(), {
      wrapper: (ui) =>
        wrapWithTheme(ui, {
          flags: {
            marketplaceAppOverrides: [
              {
                details: {
                  isNew: true,
                  related_guides: [
                    { href: 'https://akamai.com', title: 'Overwritten Doc' },
                  ],
                },
                stackscriptId: 0,
              },
            ],
          },
        }),
    });

    await waitFor(() => {
      expect(result.current.apps[0].details.related_guides?.[0].title).toBe(
        'Overwritten Doc'
      );
      expect(result.current.apps[0].details.related_guides?.[0].href).toBe(
        'https://akamai.com'
      );
      expect(result.current.apps[0].details.isNew).toBe(true);
    });
  });

  it('should be able to hide an app with the marketplaceAppOverrides feature flag', async () => {
    const stackscript = stackScriptFactory.build({
      id: 0,
      label: 'Linode Marketplace App',
    });

    server.use(
      http.get('*/v4/linode/stackscripts', () => {
        return HttpResponse.json(makeResourcePage([stackscript]));
      })
    );

    const { result } = renderHook(() => useMarketplaceApps(), {
      wrapper: (ui) =>
        wrapWithTheme(ui, {
          flags: {
            marketplaceAppOverrides: [
              {
                details: null,
                stackscriptId: 0,
              },
            ],
          },
        }),
    });

    await waitFor(() => expect(result.current.data).toBeDefined());

    expect(result.current.apps).toHaveLength(0);
  });
});
