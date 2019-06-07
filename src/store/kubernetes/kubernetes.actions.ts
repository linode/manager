import actionCreatorFactory from 'typescript-fsa';

export const actionCreator = actionCreatorFactory(`@@manager/kubernetes`);

export const requestClustersActions = actionCreator.async<
  void,
  Linode.KubernetesCluster[],
  Linode.ApiFieldError[]
>('request');

export const addOrUpdateCluster = actionCreator<Linode.KubernetesCluster>(
  'add_or_update'
);
