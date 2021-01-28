export * from './account';
export * from './accountSettings';
export * from './billing';
export * from './config';
export * from './databases';
export * from './disk';
export * from './domain';
export * from './events';
export * from './firewalls';
export * from './images';
export * from './kubernetesCluster';
export * from './linodeConfigs';
export * from './linodes';
export * from './longviewClient';
export * from './longviewDisks';
export * from './longviewProcess';
export * from './longviewService';
export * from './longviewResponse';
export * from './longviewSubscription';
export * from './longviewTopProcesses';
export * from './managed';
export * from './networking';
export * from './nodebalancer';
export * from './notification';
export * from './oauth';
export * from './objectStorage';
export * from './profile';
export * from './promotionalOffer';
export * from './regions';
export * from './stackscripts';
export * from './support';
export * from './tags';
export * from './volume';
export * from './vlans';

// Convert factory output to our itemsById pattern
export const normalizeEntities = (entities: any[]) => {
  return entities.reduce((acc, thisThing) => {
    return { ...acc, [thisThing.id]: thisThing };
  }, {});
};
