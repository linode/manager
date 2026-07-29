import type { NodeBalancerConfigNodeWithPort } from './types';

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
    // If the address is an IPv6 address, we need to wrap it in brackets to avoid confusion with the port number.
    address: n.address.includes(':')
      ? `[${n.address}]:${n.port}`
      : `${n.address}:${n.port}`,
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
      // If the address is an IPv6 address, we need to wrap it in brackets to avoid confusion with the port number.
      address: n.address.includes(':')
        ? `[${n.address}]:${n.port}`
        : `${n.address}:${n.port}`,
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
      // If the address is an IPv6 address, we need to wrap it in brackets to avoid confusion with the port number.
      address: n.address.includes(':')
        ? `[${n.address}]:${n.port}`
        : `${n.address}:${n.port}`,
      label: n.label,
      mode: n.mode,
      weight: n.weight,
      subnet_id: n.subnet_id,
    })),
  })),
});

export const mergeAddressAndPort = (node: NodeBalancerConfigNodeWithPort) => ({
  ...node,
  // If the address is an IPv6 address, we need to wrap it in brackets to avoid confusion with the port number.
  address: node.address.includes(':')
    ? `[${node.address}]:${node.port}`
    : `${node.address}:${node.port}`,
});
