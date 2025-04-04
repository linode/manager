import { NodeBalancerConfigNodeWithPort } from './types';

export const combineConfigNodeAddressAndPort = (data: any) => ({
  ...data,
  nodes: data.nodes.map((n: any) => ({
    address: `${n.address}:${n.port}`,
    label: n.label,
    mode: n.mode,
    weight: n.weight,
  })),
});

export const combineConfigNodeAddressAndPortBeta = (data: any) => ({
  ...data,
  nodes: data.nodes.map((n: any) => ({
    address: `${n.address}:${n.port}`,
    label: n.label,
    mode: n.mode,
    weight: n.weight,
    subnet_id: n.subnet_id,
  })),
});

export const combineNodeBalancerConfigNodeAddressAndPort = (data: any) => ({
  ...data,
  configs: data.configs.map((c: any) => ({
    ...c,
    nodes: c.nodes.map((n: any) => ({
      address: `${n.address}:${n.port}`,
      label: n.label,
      mode: n.mode,
      weight: n.weight,
    })),
  })),
});

export const combineNodeBalancerConfigNodeAddressAndPortBeta = (data: any) => ({
  ...data,
  configs: data.configs.map((c: any) => ({
    ...c,
    nodes: c.nodes.map((n: any) => ({
      address: `${n.address}:${n.port}`,
      label: n.label,
      mode: n.mode,
      weight: n.weight,
      subnet_id: n.subnet_id,
    })),
  })),
});

export const mergeAddressAndPort = (node: NodeBalancerConfigNodeWithPort) => ({
  ...node,
  address: `${node.address}:${node.port}`,
});
