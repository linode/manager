import userEvent from '@testing-library/user-event';
import React from 'react';

import { stackScriptFactory } from 'src/factories';
import { oneClickApps } from 'src/features/OneClickApps/oneClickAppsv2';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { AppSection } from './AppSection';

describe('AppSection', () => {
  it('should render a title', () => {
    const { getByText } = renderWithTheme(
      <AppSection
        apps={[]}
        onOpenDetailsDrawer={vi.fn()}
        onSelect={vi.fn()}
        selectedStackscriptId={undefined}
        title="Test title"
      />
    );

    expect(getByText('Test title')).toBeVisible();
  });

  it('should render apps', () => {
    const app = {
      details: oneClickApps[0],
      stackscript: stackScriptFactory.build({
        id: 0,
        label: 'Linode Marketplace App',
      }),
    };

    const { getByText } = renderWithTheme(
      <AppSection
        apps={[app]}
        onOpenDetailsDrawer={vi.fn()}
        onSelect={vi.fn()}
        selectedStackscriptId={undefined}
        title="Test title"
      />
    );

    expect(getByText('Linode Marketplace App')).toBeVisible();
  });

  it('should call `onOpenDetailsDrawer` when the details button is clicked for an app', async () => {
    const app = {
      details: oneClickApps[0],
      stackscript: stackScriptFactory.build({ id: 0 }),
    };

    const onOpenDetailsDrawer = vi.fn();

    const { getByLabelText } = renderWithTheme(
      <AppSection
        apps={[app]}
        onOpenDetailsDrawer={onOpenDetailsDrawer}
        onSelect={vi.fn()}
        selectedStackscriptId={undefined}
        title="Test title"
      />
    );

    await userEvent.click(
      getByLabelText(`Info for "${app.stackscript.label}"`)
    );

    expect(onOpenDetailsDrawer).toHaveBeenCalledWith(app.stackscript.id);
  });

  it('should call `onSelect` when an app is clicked', async () => {
    const app = {
      details: oneClickApps[0],
      stackscript: stackScriptFactory.build({ id: 0 }),
    };

    const onSelect = vi.fn();

    const { getByText } = renderWithTheme(
      <AppSection
        apps={[app]}
        onOpenDetailsDrawer={vi.fn()}
        onSelect={onSelect}
        selectedStackscriptId={undefined}
        title="Test title"
      />
    );

    await userEvent.click(getByText(app.stackscript.label));

    expect(onSelect).toHaveBeenCalledWith(app.stackscript);
  });
});
