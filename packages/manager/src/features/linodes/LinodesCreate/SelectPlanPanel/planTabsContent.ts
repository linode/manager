export const plansTabContent = {
  prodedicated: {
    typography:
      'Pro Dedicated CPU instances are for very demanding workloads. They only have AMD 2nd generation processors or newer.',
    title: 'Pro Dedicated CPU',
    key: 'prodedicated',
    dataId: 'data-qa-prodedi',
  },
  dedicated: {
    typography:
      'Dedicated CPU instances are good for full-duty workloads where consistent performance is important.',
    title: 'Dedicated CPU',
    key: 'dedicated',
    dataId: 'data-qa-dedicated',
  },
  shared: {
    typography:
      ' Shared CPU instances are good for medium-duty workloads and are a good mix of performance, resources, and price.',
    title: 'Shared CPU',
    key: 'shared',
    dataId: 'data-qa-standard',
  },
  highmem: {
    typography:
      'High Memory instances favor RAM over other resources, and can be good for memory hungry use cases like caching and in-memory databases. All High Memory plans use dedicated CPU cores.',
    title: 'High Memory',
    key: 'highmem',
    dataId: 'data-qa-highmem',
  },
  gpu: {
    typography:
      'Linodes with dedicated GPUs accelerate highly specialized applications such as machine learning, AI, and video transcoding.',
    title: 'GPU',
    key: 'gpu',
    dataId: 'data-qa-gpu',
  },
  metal: {
    typography:
      'Bare Metal Linodes give you full, dedicated access to a single physical machine. Some services, including backups, VLANs, and disk management, are not available with these plans.',
    title: 'Bare Metal',
    key: 'metal',
    dataId: 'data-qa-metal',
  },
  premium: {
    typography:
      'Premium CPU instances guarantee a minimum processor model, AMD Epyc\u2122 7713 or higher, to ensure consistent high performance for more demanding workloads.',
    notice: 'This plan is only available in the Washington, DC region.',
    title: 'Premium',
    key: 'premium',
    dataId: 'data-qa-premium',
  },
};
