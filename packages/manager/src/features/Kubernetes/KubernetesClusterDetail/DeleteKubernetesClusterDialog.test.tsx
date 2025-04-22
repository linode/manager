import { fireEvent } from '@testing-library/react';
import * as React from 'react';

import { http, HttpResponse, server } from 'src/mocks/testServer';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { DeleteKubernetesClusterDialog } from './DeleteKubernetesClusterDialog';

import type { DeleteKubernetesClusterDialogProps } from './DeleteKubernetesClusterDialog';
import type { ManagerPreferences } from '@linode/utilities';

const props: DeleteKubernetesClusterDialogProps = {
  clusterId: 1,
  clusterLabel: 'this-cluster',
  isFetching: false,
  onClose: vi.fn(),
  open: true,
};

const preference: ManagerPreferences['type_to_confirm'] = true;

const queryMocks = vi.hoisted(() => ({
  usePreferences: vi.fn().mockReturnValue({}),
}));

vi.mock('@linode/queries', async () => {
  const actual = await vi.importActual('@linode/queries');
  return {
    ...actual,
    usePreferences: queryMocks.usePreferences,
  };
});

queryMocks.usePreferences.mockReturnValue({
  data: preference,
});

describe('Kubernetes deletion dialog', () => {
  it('should close the drawer on cancel', () => {
    const { getByTestId } = renderWithTheme(
      <DeleteKubernetesClusterDialog {...props} />
    );
    const button = getByTestId('cancel');
    fireEvent.click(button);
    expect(props.onClose).toHaveBeenCalledTimes(1);
  });

  it('should not be able to submit form before the user fills out confirmation text', async () => {
    queryMocks.usePreferences.mockReturnValue({
      data: preference,
    });
    server.use(
      http.get(`*/profile/preference`, () => {
        return HttpResponse.json({
          type_to_confirm: true,
        });
      })
    );

    const { findByTestId, getByTestId } = renderWithTheme(
      <DeleteKubernetesClusterDialog {...props} />
    );
    const button = getByTestId('confirm');

    expect(button).toBeDisabled();

    await findByTestId('textfield-input');

    const input = getByTestId('textfield-input');
    fireEvent.change(input, { target: { value: 'this-cluster' } });

    expect(button).toBeEnabled();
  });
});
