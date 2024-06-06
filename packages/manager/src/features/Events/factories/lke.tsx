import * as React from 'react';

import { EventLink } from '../EventLink';

import type { PartialEventMap } from '../types';

export const lke: PartialEventMap<'lke'> = {
  lke_cluster_create: {
    notification: (e) => (
      <>
        Kubernetes Cluster <EventLink event={e} to="entity" /> has been{' '}
        <strong>created</strong>.
      </>
    ),
  },
  lke_cluster_delete: {
    notification: (e) => (
      <>
        Kubernetes Cluster {e.entity?.label} has been <strong>deleted</strong>.
      </>
    ),
  },
  lke_cluster_recycle: {
    notification: (e) => (
      <>
        Kubernetes Cluster <EventLink event={e} to="entity" /> has been{' '}
        <strong>recycled</strong>.
      </>
    ),
  },
  lke_cluster_regenerate: {
    notification: (e) => (
      <>
        Kubernetes Cluster <EventLink event={e} to="entity" /> has been{' '}
        <strong>regenerated</strong>.
      </>
    ),
  },
  lke_cluster_update: {
    notification: (e) => (
      <>
        Kubernetes Cluster <EventLink event={e} to="entity" /> has been{' '}
        <strong>updated</strong>.
      </>
    ),
  },
  lke_control_plane_acl_create: {
    notification: (e) => (
      <>
        The IP ACL for Kubernetes Cluster <EventLink event={e} to="entity" />{' '}
        has been <strong>created</strong>.
      </>
    ),
  },
  lke_control_plane_acl_delete: {
    notification: (e) => (
      <>
        The IP ACL for Kubernetes Cluster <EventLink event={e} to="entity" />{' '}
        has been <strong>disabled</strong>.
      </>
    ),
  },
  lke_control_plane_acl_update: {
    notification: (e) => (
      <>
        The IP ACL for Kubernetes Cluster <EventLink event={e} to="entity" />{' '}
        has been <strong>updated</strong>.
      </>
    ),
  },
  lke_kubeconfig_regenerate: {
    notification: (e) => (
      <>
        The kubeconfig for Kubernetes Cluster{' '}
        <EventLink event={e} to="entity" /> has been{' '}
        <strong>regenerated</strong>.
      </>
    ),
  },
  lke_node_create: {
    // This event is a special case; a notification means the node creation failed.
    // The entity is the node pool, but entity.label contains the cluster's label.
    notification: (e) => (
      <>
        Kubernetes Cluster node could <strong>not</strong> be{' '}
        <strong>created</strong>
        {e.entity?.label ? ' on ' : ''}
        <EventLink event={e} to="entity" />.
      </>
    ),
  },
  lke_node_recycle: {
    notification: (e) => (
      <>
        The node for Kubernetes Cluster <EventLink event={e} to="entity" /> has
        been <strong>recycled</strong>.
      </>
    ),
  },
  lke_pool_create: {
    notification: (e) => (
      <>
        A Node Pool for Kubernetes Cluster <EventLink event={e} to="entity" />{' '}
        has been <strong>created</strong>.
      </>
    ),
  },
  lke_pool_delete: {
    notification: (e) => (
      <>
        A Node Pool for Kubernetes Cluster <EventLink event={e} to="entity" />{' '}
        has been <strong>deleted</strong>.
      </>
    ),
  },
  lke_pool_recycle: {
    notification: (e) => (
      <>
        A Node Pool for Kubernetes Cluster <EventLink event={e} to="entity" />{' '}
        has been <strong>recycled</strong>.
      </>
    ),
  },
  lke_token_rotate: {
    notification: (e) => (
      <>
        The token for Kubernetes Cluster <EventLink event={e} to="entity" /> has
        been <strong>rotated</strong>.
      </>
    ),
  },
};
