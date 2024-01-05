import type { ServiceTargetPayload } from '@linode/api-v4';

/**
 * Replaces empty strings with `null` in ServiceTargetPayload
 * so that the API accepts the request.
 */
export const getNormalizedServiceTargetPayload = (
  serviceTarget: ServiceTargetPayload
) => ({
  ...serviceTarget,
  endpoints: serviceTarget.endpoints.map((e) => ({
    ...e,
    host: e.host ? e.host : null,
  })),
  healthcheck: {
    ...serviceTarget.healthcheck,
    host:
      serviceTarget.healthcheck.host &&
      serviceTarget.healthcheck.protocol === 'http'
        ? serviceTarget.healthcheck.host
        : null,
    path:
      serviceTarget.healthcheck.path &&
      serviceTarget.healthcheck.protocol === 'http'
        ? serviceTarget.healthcheck.path
        : null,
  },
});
