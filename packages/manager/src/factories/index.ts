export * from './account';
export * from './accountAgreements';
export * from './accountLogin';
export * from './accountMaintenance';
export * from './accountOAuth';
export * from './accountPayment';
export * from './accountSettings';
export * from './accountUsers';
export * from './billing';
export * from './cloudnats';
export * from './cloudpulse/alerts';
export * from './cloudpulse/channels';
export * from './cloudpulse/services';
export * from './dashboards';
export * from './databases';
export * from './disk';
export * from './domain';
export * from './entityTransfers';
export * from './events';
export * from './featureFlags';
export * from './firewalls';
export * from './images';
export * from './kernels';
export * from './kubernetesCluster';
export * from './linodeConfigs';
export * from './longviewClient';
export * from './longviewDisks';
export * from './longviewProcess';
export * from './longviewResponse';
export * from './longviewService';
export * from './longviewSubscription';
export * from './longviewTopProcesses';
export * from './managed';
export * from './networking';
export * from './notification';
export * from './oauth';
export * from './objectStorage';
export * from './placementGroups';
export * from './preferences';
export * from './promotionalOffer';
export * from './stackscripts';
export * from './statusPage';
export * from './subnets';
export * from './support';
export * from './tags';
export * from './types';
export * from './vlans';
export * from './volume';
export * from './vpcs';

// Convert factory output to our itemsById pattern
export const normalizeEntities = (entities: any[]) => {
  return entities.reduce((acc, thisThing) => {
    return { ...acc, [thisThing.id]: thisThing };
  }, {});
};
