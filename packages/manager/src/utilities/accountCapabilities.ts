import { AccountCapability } from 'linode-js-sdk/lib/account'

import { curry } from 'ramda';

import {
  isKubernetesEnabledForEnvironment,
  isObjectStorageEnabledForEnvironment
} from 'src/constants';

/**
 * Determines if a feature should be enabled. If the feature is returned from account.capabilities or if it is explicitly enabled
 * in an environment variable (from Jenkins or .env), enable the feature.
 *
 * Curried to make later feature functions easier to write. Usage:
 *
 * const isMyFeatureEnabled = isFeatureEnabled('Feature two');
 * isMyFeatureEnabled(ENV_VAR, account.capabilities)
 *
 * or, since we have access to environment variables from this file:
 *
 * const isMyFeatureEnabled = isFeatureEnabled('feature name', ENV_VAR);
 *
 * isMyFeatureEnabled(['Feature one', 'Feature two']) // true
 */

const isFeatureEnabled = curry(
  (
    featureName: AccountCapability,
    environmentVar: boolean,
    capabilities: AccountCapability[]
  ) => {
    return environmentVar || capabilities.indexOf(featureName) > -1;
  }
);

export const isObjectStorageEnabled = isFeatureEnabled(
  'Object Storage',
  isObjectStorageEnabledForEnvironment
);

export const isKubernetesEnabled = isFeatureEnabled(
  'Kubernetes',
  isKubernetesEnabledForEnvironment
);
