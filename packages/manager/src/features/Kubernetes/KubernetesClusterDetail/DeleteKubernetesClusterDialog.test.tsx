import { fireEvent, waitForElementToBeRemoved } from '@testing-library/react';
import * as React from 'react';
import { QueryClient } from 'react-query';
import { kubeLinodeFactory, nodePoolFactory } from 'src/factories';
import { makeResourcePage } from 'src/mocks/serverHandlers';
import { rest, server } from 'src/mocks/testServer';
import { renderWithTheme } from 'src/utilities/testHelpers';
import {
  Props,
  DeleteKubernetesClusterDialog,
} from './DeleteKubernetesClusterDialog';

const props: Props = {
  open: true,
  clusterLabel: 'this-cluster',
  clusterId: 1,
  onClose: jest.fn(),
};

const queryClient = new QueryClient();

afterEach(() => {
  queryClient.clear();
});

describe('Kubernetes deletion dialog', () => {
  it('should display a count of node pools in the cluster', async () => {
    server.use(
      rest.get(`*/lke/clusters/${props.clusterId}/pools`, (req, res, ctx) => {
        const pools = nodePoolFactory.buildList(1, {
          count: 1,
          nodes: kubeLinodeFactory.buildList(1),
        });
        return res(ctx.json(makeResourcePage(pools)));
      })
    );

    const { queryByText, getByTestId } = renderWithTheme(
      <DeleteKubernetesClusterDialog {...props} />,
      {
        queryClient,
      }
    );

    await waitForElementToBeRemoved(getByTestId('circle-progress'));

    expect(queryByText('1 node pool')).toBeInTheDocument();
  });

  it('should display a count of the number of Linodes in the cluster', async () => {
    server.use(
      rest.get(`*/lke/clusters/${props.clusterId}/pools`, (req, res, ctx) => {
        const pools = nodePoolFactory.buildList(1, {
          count: 1,
          nodes: kubeLinodeFactory.buildList(1),
        });
        return res(ctx.json(makeResourcePage(pools)));
      })
    );

    const { queryByText, getByTestId } = renderWithTheme(
      <DeleteKubernetesClusterDialog {...props} />,
      {
        queryClient,
      }
    );

    await waitForElementToBeRemoved(getByTestId('circle-progress'));

    expect(queryByText('1 Linode')).toBeInTheDocument();
  });

  it('should handle plural values', async () => {
    server.use(
      rest.get(`*/lke/clusters/${props.clusterId}/pools`, (req, res, ctx) => {
        const pools = nodePoolFactory.buildList(2, {
          count: 3,
          nodes: kubeLinodeFactory.buildList(3),
        });
        return res(ctx.json(makeResourcePage(pools)));
      })
    );

    const { queryByText, getByTestId } = renderWithTheme(
      <DeleteKubernetesClusterDialog {...props} />,
      {
        queryClient,
      }
    );

    await waitForElementToBeRemoved(getByTestId('circle-progress'));

    expect(queryByText(/2 node pools/)).toBeInTheDocument();
    expect(queryByText(/6 Linodes/)).toBeInTheDocument();
  });

  it('should close the drawer on cancel', () => {
    const { getByTestId } = renderWithTheme(
      <DeleteKubernetesClusterDialog {...props} />
    );
    const button = getByTestId('dialog-cancel');
    fireEvent.click(button);
    expect(props.onClose).toHaveBeenCalledTimes(1);
  });

  it('should not be able to submit form before the user fills out confirmation text', () => {
    server.use(
      rest.get(`*/profile/preference`, (req, res, ctx) => {
        return res(
          ctx.json({
            type_to_confirm: true,
          })
        );
      })
    );

    const { getByTestId } = renderWithTheme(
      <DeleteKubernetesClusterDialog {...props} />
    );
    const button = getByTestId('dialog-confirm');

    expect(button).toBeDisabled();

    const input = getByTestId('textfield-input');
    fireEvent.change(input, { target: { value: 'this-cluster' } });

    expect(button).toBeEnabled();
  });
});
