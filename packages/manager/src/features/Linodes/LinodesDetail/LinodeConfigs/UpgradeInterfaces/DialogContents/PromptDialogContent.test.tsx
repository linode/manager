import { waitForElementToBeRemoved } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import { linodeConfigFactory } from 'src/factories';
import { makeResourcePage } from 'src/mocks/serverHandlers';
import { http, HttpResponse, server } from 'src/mocks/testServer';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { PromptDialogContent } from './PromptDialogContent';

import type {
  PromptDialogState,
  UpgradeInterfacesDialogContentProps,
} from '../types';

const loadingTestId = 'circle-progress';

const props = {
  linodeId: 1,
  onClose: vi.fn(),
  open: true,
  setDialogState: vi.fn(),
  state: {
    dialogTitle: 'Upgrade Interfaces',
    step: 'prompt',
  },
} as UpgradeInterfacesDialogContentProps<PromptDialogState>;

describe('PromptDialogContent', () => {
  it('can render the prompt content', async () => {
    server.use(
      http.get('*/linode/instances/:id/configs', () => {
        return HttpResponse.json(
          makeResourcePage(linodeConfigFactory.buildList(2))
        );
      })
    );

    const { getByTestId, getByText } = renderWithTheme(
      <PromptDialogContent {...props} />
    );

    // Loading state should render
    expect(getByTestId(loadingTestId)).toBeInTheDocument();

    await waitForElementToBeRemoved(getByTestId(loadingTestId));

    getByText('Perform Dry Run');
    getByText('Upgrade Interfaces');
    getByText('Cancel');
  });

  it('can close the dialog', async () => {
    server.use(
      http.get('*/linode/instances/:id/configs', () => {
        return HttpResponse.json(
          makeResourcePage(linodeConfigFactory.buildList(2))
        );
      })
    );

    const { getByTestId, getByText } = renderWithTheme(
      <PromptDialogContent {...props} />
    );

    // Loading state should render
    expect(getByTestId(loadingTestId)).toBeInTheDocument();

    await waitForElementToBeRemoved(getByTestId(loadingTestId));

    const cancelButton = getByText('Cancel');
    await userEvent.click(cancelButton);
    expect(props.onClose).toHaveBeenCalled();
  });
});
