import { fireEvent } from '@testing-library/react';
import * as React from 'react';
import { QueryClient } from 'react-query';

import { rest, server } from 'src/mocks/testServer';
import { renderWithTheme } from 'src/utilities/testHelpers';

import {
  DeleteKubernetesClusterDialog,
  Props,
} from './DeleteKubernetesClusterDialog';

const props: Props = {
  clusterId: 1,
  clusterLabel: 'this-cluster',
  onClose: vi.fn(),
  open: true,
};

const queryClient = new QueryClient();

afterEach(() => {
  queryClient.clear();
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
    server.use(
      rest.get(`*/profile/preference`, (req, res, ctx) => {
        return res(
          ctx.json({
            type_to_confirm: true,
          })
        );
      })
    );

    const { findByTestId, getByTestId } = renderWithTheme(
      <DeleteKubernetesClusterDialog {...props} />
    );
    const button = getByTestId('confirm');

    expect(button).toHaveAttribute('aria-disabled', 'true');

    await findByTestId('textfield-input');

    const input = getByTestId('textfield-input');
    fireEvent.change(input, { target: { value: 'this-cluster' } });

    expect(button).toHaveAttribute('aria-disabled', 'false');
  });
});
