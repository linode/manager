import userEvent from '@testing-library/user-event';
import React from 'react';

import { stackScriptFactory } from 'src/factories';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { AppSection } from './AppSection';

describe('AppSection', () => {
  it('should render a title', () => {
    const { getByText } = renderWithTheme(
      <AppSection
        onOpenDetailsDrawer={vi.fn()}
        onSelect={vi.fn()}
        selectedStackscriptId={undefined}
        stackscripts={[]}
        title="Test title"
      />
    );

    expect(getByText('Test title')).toBeVisible();
  });

  it('should render apps', () => {
    const app = stackScriptFactory.build({
      id: 0,
      label: 'Linode Marketplace App',
    });

    const { getByText } = renderWithTheme(
      <AppSection
        onOpenDetailsDrawer={vi.fn()}
        onSelect={vi.fn()}
        selectedStackscriptId={undefined}
        stackscripts={[app]}
        title="Test title"
      />
    );

    expect(getByText('Linode Marketplace App')).toBeVisible();
  });

  it('should call `onOpenDetailsDrawer` when the details button is clicked for an app', async () => {
    const app = stackScriptFactory.build({ id: 0 });
    const onOpenDetailsDrawer = vi.fn();

    const { getByLabelText } = renderWithTheme(
      <AppSection
        onOpenDetailsDrawer={onOpenDetailsDrawer}
        onSelect={vi.fn()}
        selectedStackscriptId={undefined}
        stackscripts={[app]}
        title="Test title"
      />
    );

    await userEvent.click(getByLabelText(`Info for "${app.label}"`));

    expect(onOpenDetailsDrawer).toHaveBeenCalledWith(app.id);
  });

  it('should call `onSelect` when an app is clicked', async () => {
    const app = stackScriptFactory.build({ id: 0 });
    const onSelect = vi.fn();

    const { getByText } = renderWithTheme(
      <AppSection
        onOpenDetailsDrawer={vi.fn()}
        onSelect={onSelect}
        selectedStackscriptId={undefined}
        stackscripts={[app]}
        title="Test title"
      />
    );

    await userEvent.click(getByText(app.label));

    expect(onSelect).toHaveBeenCalledWith(app);
  });
});
