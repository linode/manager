import {
  ConfigNodeStatus,
  CreateNodeBalancerConfigNodePayload,
  CreateNodeBalancerConfigPayload,
  NodeBalancerConfig,
  NodeBalancerConfigNode
} from 'linode-js-sdk/lib/nodebalancers';
import { APIError } from 'linode-js-sdk/lib/types';
import { clamp, compose, filter, isNil, toString } from 'ramda';

import defaultNumeric from 'src/utilities/defaultNumeric';

export type WithModifyStatusAndErrors<T> = T & {
  modifyStatus?: string;
  errors?: APIError[];
};

export const clampNumericString = (low: number, hi: number) =>
  compose(
    toString,
    clamp(low, hi),
    (value: number) => defaultNumeric(0, value)
  ) as (value: any) => string;

export type CreateNode = WithModifyStatusAndErrors<
  CreateNodeBalancerConfigNodePayload
>;
export type CreateNodeWithStatus = CreateNode & {
  status?: ConfigNodeStatus;
  port?: number;
};

interface AlteredCreateConfig
  extends Omit<CreateNodeBalancerConfigPayload, 'nodes'> {
  nodes: CreateNodeWithStatus[];
}

export type CreateConfig = WithModifyStatusAndErrors<AlteredCreateConfig>;

export type RequestedConfig<
  T = WithModifyStatusAndErrors<NodeBalancerConfigNode>
> = WithModifyStatusAndErrors<NodeBalancerConfig & { nodes: T[] }>;

export const createNewNodeBalancerConfigNode = (): CreateNode => ({
  label: '',
  address: '',
  weight: 100,
  mode: 'accept',
  modifyStatus: 'new'
});

export const createNewNodeBalancerConfig = (
  withDefaultPort?: boolean
): CreateConfig => ({
  algorithm: 'roundrobin',
  check_attempts: 2,
  check_body: '',
  check_interval: 5,
  check_passive: true,
  check_path: '',
  check_timeout: 3,
  check: 'none',
  cipher_suite: 'recommended',
  port: withDefaultPort ? 80 : 80,
  protocol: 'http',
  ssl_cert: '',
  ssl_key: '',
  stickiness: 'table',
  nodes: [createNewNodeBalancerConfigNode()],
  modifyStatus: 'new'
});

/* Transform an array of configs into valid request data.
   Does not modify in-place, returns a deep clone of the configs */
export const transformConfigsForRequest = (
  configs: CreateConfig[]
): CreateNodeBalancerConfigPayload[] => {
  return configs.map(config => {
    return filter(
      /* remove the (key: value) pairs that we set to undefined */
      el => el !== undefined,
      {
        check_path: config.check_path || undefined,
        protocol:
          /*
           * If the provided protocol is "https" and the cert and key are set
           * to "<REDACTED", don't try to set the protocol, it has already
           * been set to "https".
           */
          config.protocol === 'https' &&
          config.ssl_cert === '<REDACTED>' &&
          config.ssl_key === '<REDACTED>'
            ? undefined
            : config.protocol || undefined,
        algorithm: config.algorithm || undefined,
        stickiness: config.stickiness || undefined,
        check: config.check || undefined,
        check_interval: !isNil(config.check_interval)
          ? +config.check_interval
          : undefined,
        check_timeout: !isNil(config.check_timeout)
          ? +config.check_timeout
          : undefined,
        check_attempts: !isNil(config.check_attempts)
          ? +config.check_attempts
          : undefined,
        port: config.port ? +config.port : undefined,
        check_body: config.check_body || undefined,
        check_passive: config.check_passive /* will be boolean or undefined */,
        cipher_suite: config.cipher_suite || undefined,
        ssl_cert:
          config.ssl_cert === '<REDACTED>'
            ? undefined
            : config.ssl_cert || undefined,
        ssl_key:
          config.ssl_key === '<REDACTED>'
            ? undefined
            : config.ssl_key || undefined,
        nodes: (config.nodes || []).map(eachNode => {
          const [
            alreadyExistingAddress,
            alreadyExistingPort
          ] = eachNode.address.split(':');
          return {
            ...eachNode,
            /** the API wants the address in a ADDRESS:PORT format */
            address: `${alreadyExistingAddress}:${alreadyExistingPort ||
              eachNode.port ||
              ''}`
          };
        }),
        id: undefined,
        nodebalancer_id: undefined,
        nodes_status: undefined,
        ssl_fingerprint: undefined,
        ssl_commonname: undefined
      }
    );
  });
};
