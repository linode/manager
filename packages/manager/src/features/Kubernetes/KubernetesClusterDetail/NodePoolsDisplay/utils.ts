import type { NodeRow } from './NodeRow';
import type { Linode, PoolNodeResponse } from '@linode/api-v4';

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
