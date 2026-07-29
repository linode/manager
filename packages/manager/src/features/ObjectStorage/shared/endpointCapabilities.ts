import type { ObjectStorageEndpointTypes } from '@linode/api-v4';

export interface EndpointCapabilities {
  cors: boolean;
  customTlsCertificate: boolean;
  metrics: boolean;
  objectAcl: boolean;
}

const DEFAULT_ENDPOINT_CAPABILITIES: EndpointCapabilities = {
  objectAcl: false,
  cors: false,
  customTlsCertificate: false,
  metrics: false,
};

const GEN_1_ENDPOINT_CAPABILITIES: EndpointCapabilities = {
  objectAcl: true,
  cors: true,
  customTlsCertificate: true,
  metrics: false,
};

const GEN_2_ENDPOINT_CAPABILITIES: EndpointCapabilities = {
  objectAcl: false,
  cors: false,
  customTlsCertificate: false,
  metrics: true,
};

const ENDPOINT_CAPABILITIES_MAP: Record<
  ObjectStorageEndpointTypes,
  EndpointCapabilities
> = {
  E0: GEN_1_ENDPOINT_CAPABILITIES,
  E1: GEN_1_ENDPOINT_CAPABILITIES,
  E2: GEN_2_ENDPOINT_CAPABILITIES,
  E3: GEN_2_ENDPOINT_CAPABILITIES,
};

/**
 * Return the feature-capability set for a given Object Storage endpoint type.
 *
 * The Cloud Manager supports multiple generations/types of object storage
 * endpoints. Each type exposes a different set of features (CORS, object ACLs,
 * custom TLS certificates, metrics, etc.). This helper maps an endpoint's type
 * (e.g. 'E0', 'E1', 'E2', 'E3') to a small struct of boolean capability flags.
 *
 * @param endpointType - The endpoint "type" (e.g. 'E0' | 'E1' | 'E2' | 'E3'),
 *   or `undefined` when the type is unknown.
 * @returns An `EndpointCapabilities` object with boolean flags for supported
 *   features on the given endpoint type.
 */
export function getEndpointCapabilities(
  endpointType: ObjectStorageEndpointTypes | undefined
): EndpointCapabilities {
  return endpointType
    ? (ENDPOINT_CAPABILITIES_MAP[endpointType] ?? DEFAULT_ENDPOINT_CAPABILITIES)
    : DEFAULT_ENDPOINT_CAPABILITIES;
}
