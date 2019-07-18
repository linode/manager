export const combineConfigNodeAddressAndPort = (data: any) => ({
  ...data,
  nodes: data.nodes.map((n: any) => ({
    address: `${n.address}:${n.port}`,
    label: n.label,
    mode: n.mode,
    weight: n.weight
  }))
});

export const combineNodeBalancerConfigNodeAddressAndPort = (data: any) => ({
  ...data,
  configs: data.configs.map((c: any) => ({
    ...c,
    nodes: c.nodes.map((n: any) => ({
      address: `${n.address}:${n.port}`,
      label: n.label,
      mode: n.mode,
      weight: n.weight
    }))
  }))
});

export const mergeAddressAndPort = (node: Linode.NodeBalancerConfigNode) => ({
  ...node,
  address: `${node.address}:${node.port}`
});
