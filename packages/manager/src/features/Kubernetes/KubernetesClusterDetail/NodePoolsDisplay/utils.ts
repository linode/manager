import { useTypeQuery } from '@linode/queries';
import { formatStorageUnits } from '@linode/utilities';

import type { NodeRow } from './NodeRow';
import type {
  KubeNodePoolResponse,
  Linode,
  PoolNodeResponse,
} from '@linode/api-v4';

/**
 * Checks whether prices are valid - 0 is valid, but undefined and null prices are invalid.
 * @returns true if either value is null or undefined
 */
export const hasInvalidNodePoolPrice = (
  pricePerNode: null | number | undefined,
  totalPrice: null | number | undefined
) => {
  const isInvalidPricePerNode = !pricePerNode && pricePerNode !== 0;
  const isInvalidTotalPrice = !totalPrice && totalPrice !== 0;

  return isInvalidPricePerNode || isInvalidTotalPrice;
};

/**
 * Transforms an LKE Pool Node to a NodeRow.
 */
export const nodeToRow = (
  node: PoolNodeResponse,
  linodes: Linode[],
  shouldShowVpcIPAddressColumns: boolean
): NodeRow => {
  const foundLinode = linodes.find(
    (thisLinode) => thisLinode.id === node.instance_id
  );

  return {
    instanceId: node.instance_id || undefined,
    instanceStatus: foundLinode?.status,
    ip: foundLinode?.ipv4[0],
    label: foundLinode?.label,
    nodeId: node.id,
    nodeStatus: node.status,
    shouldShowVpcIPAddressColumns,
  };
};

interface NodePoolDisplayLabelOptions {
  /**
   * If set to `true`, the hook will only return the node pool's type's `id` or `label`
   * and never its actual `label`
   */
  ignoreNodePoolsLabel?: boolean;
  /**
   * Appends a suffix to the Node Pool's type `id` or `label` if it is returned
   */
  suffix?: string;
}

/**
 * Given a Node Pool, this hook will return the Node Pool's display label.
 *
 * We use this helper rather than just using `label` on the Node Pool because the `label`
 * field is optional was added later on to the API. For Node Pools without explicit labels,
 * we identify them in the UI by their plan's label.
 *
 * @returns The Node Pool's label
 */
export const useNodePoolDisplayLabel = (
  nodePool: Pick<KubeNodePoolResponse, 'label' | 'type'> | undefined,
  options?: NodePoolDisplayLabelOptions
) => {
  const { data: type } = useTypeQuery(
    nodePool?.type ?? '',
    Boolean(nodePool?.type)
  );

  if (!nodePool) {
    return '';
  }

  // @TODO uncomment this when it's time to surface Node Pool labels in the UI (ECE-353)
  // If the Node Pool has an explict label, return it.
  // if (nodePool.label && !options?.ignoreNodePoolsLabel) {
  //   return nodePool.label;
  // }

  // If the Node Pool's type is loaded, return that type's formatted label.
  if (type) {
    const typeLabel = formatStorageUnits(type.label);

    if (options?.suffix) {
      return `${typeLabel} ${options.suffix}`;
    }

    return typeLabel;
  }

  // As a last resort, fallback to the Node Pool's type ID.
  if (options?.suffix) {
    return `${nodePool.type} ${options.suffix}`;
  }

  return nodePool.type;
};
