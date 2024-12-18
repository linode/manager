export * from './account';
export * from './accountAgreements';
export * from './accountAvailability';
export * from './accountLogin';
export * from './accountMaintenance';
export * from './accountOAuth';
export * from './accountPayment';
export * from './accountSettings';
export * from './accountUsers';
export * from './betas';
export * from './billing';
export * from './config';
export * from './databases';
export * from './disk';
export * from './domain';
export * from './entityTransfers';
export * from './events';
export * from './featureFlags';
export * from './firewalls';
export * from './grants';
export * from './images';
export * from './kernels';
export * from './kubernetesCluster';
export * from './linodeConfigInterfaceFactory';
export * from './linodeConfigs';
export * from './linodes';
export * from './longviewClient';
export * from './longviewDisks';
export * from './longviewProcess';
export * from './longviewResponse';
export * from './longviewService';
export * from './longviewSubscription';
export * from './longviewTopProcesses';
export * from './managed';
export * from './networking';
export * from './nodebalancer';
export * from './notification';
export * from './oauth';
export * from './objectStorage';
export * from './placementGroups';
export * from './preferences';
export * from './profile';
export * from './promotionalOffer';
export * from './regions';
export * from './stackscripts';
export * from './statusPage';
export * from './subnets';
export * from './support';
export * from './tags';
export * from './types';
export * from './vlans';
export * from './volume';
export * from './vpcs';
export * from './dashboards';
export * from './cloudpulse/services';
export * from './cloudpulse/alerts';

// Convert factory output to our itemsById pattern
const normalizeEntities = (entities: any[]) => {
  return entities.reduce((acc, thisThing) => {
    return { ...acc, [thisThing.id]: thisThing };
  }, {});
};
