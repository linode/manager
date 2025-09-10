import { linodeTypeFactory } from '@linode/utilities';
import { renderHook, waitFor } from '@testing-library/react';

import { nodePoolFactory } from 'src/factories/kubernetesCluster';
import { http, HttpResponse, server } from 'src/mocks/testServer';
import { wrapWithTheme as wrapper } from 'src/utilities/testHelpers';

import { hasInvalidNodePoolPrice, useNodePoolDisplayLabel } from './utils';

describe('hasInvalidNodePoolPrice', () => {
  it('returns false if the prices are both zero, which is valid', () => {
    expect(hasInvalidNodePoolPrice(0, 0)).toBe(false);
  });

  it('returns true if at least one of the prices is undefined', () => {
    expect(hasInvalidNodePoolPrice(0, undefined)).toBe(true);
    expect(hasInvalidNodePoolPrice(undefined, 0)).toBe(true);
    expect(hasInvalidNodePoolPrice(undefined, undefined)).toBe(true);
  });

  it('returns true if at least one of the prices is null', () => {
    expect(hasInvalidNodePoolPrice(0, null)).toBe(true);
    expect(hasInvalidNodePoolPrice(null, 0)).toBe(true);
    expect(hasInvalidNodePoolPrice(null, null)).toBe(true);
  });
});

describe('useNodePoolDisplayLabel', () => {
  // @TODO remove skip this when it's time to surface Node Pool labels in the UI (ECE-353)
  it.skip("returns the node pools's label if it has one", () => {
    const nodePool = nodePoolFactory.build({ label: 'my-node-pool-1' });

    const { result } = renderHook(() => useNodePoolDisplayLabel(nodePool), {
      wrapper,
    });

    expect(result.current).toBe('my-node-pool-1');
  });

  it("returns the node pools's type ID initialy if it does not have an explicit label", () => {
    const nodePool = nodePoolFactory.build({
      label: '',
      type: 'g6-fake-type-1',
    });

    const { result } = renderHook(() => useNodePoolDisplayLabel(nodePool), {
      wrapper,
    });

    expect(result.current).toBe('g6-fake-type-1');
  });

  it('appends a suffix to the Linode type if one is provided', () => {
    const nodePool = nodePoolFactory.build({
      label: '',
      type: 'g6-fake-type-1',
    });

    const { result } = renderHook(
      () => useNodePoolDisplayLabel(nodePool, { suffix: 'Plan' }),
      {
        wrapper,
      }
    );

    expect(result.current).toBe('g6-fake-type-1 Plan');
  });

  it("returns the node pools's type's `label` once it loads if it does not have an explicit label", async () => {
    const type = linodeTypeFactory.build({
      id: 'g6-fake-type-1',
      label: 'Fake Linode 2GB',
    });

    server.use(
      http.get('*/v4*/linode/types/:id', () => HttpResponse.json(type))
    );

    const nodePool = nodePoolFactory.build({
      label: '',
      type: type.id,
    });

    const { result } = renderHook(() => useNodePoolDisplayLabel(nodePool), {
      wrapper,
    });

    await waitFor(() => {
      expect(result.current).toBe('Fake Linode 2 GB');
    });
  });
});
