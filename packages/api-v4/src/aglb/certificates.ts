import Request, {
  setData,
  setMethod,
  setParams,
  setURL,
  setXFilter,
} from '../request';
import { BETA_API_ROOT } from '../constants';
import { Filter, Params, ResourcePage } from '../types';
import { Certificate, CreateCertificatePayload } from './types';
import { CreateCertificateSchema } from '@linode/validation';

/**
 * getLoadbalancerCertificates
 *
 * Returns a paginated list of Akamai Global Load Balancer certificates
 */
export const getLoadbalancerCertificates = (
  loadbalancerId: number,
  params?: Params,
  filter?: Filter
) =>
  Request<ResourcePage<Certificate>>(
    setURL(
      `${BETA_API_ROOT}/aglb/${encodeURIComponent(loadbalancerId)}/certificates`
    ),
    setMethod('GET'),
    setParams(params),
    setXFilter(filter)
  );

/**
 * getLoadbalancerCertificate
 *
 * Returns an Akamai Global Load Balancer certificate
 */
export const getLoadbalancerCertificate = (
  loadbalancerId: number,
  certificateId: number
) =>
  Request<Certificate>(
    setURL(
      `${BETA_API_ROOT}/aglb/${encodeURIComponent(
        loadbalancerId
      )}/certificates/${encodeURIComponent(certificateId)}`
    ),
    setMethod('GET')
  );

/**
 * createLoadbalancerCertificate
 *
 * Creates an Akamai Global Load Balancer certificate
 */
export const createLoadbalancerCertificate = (
  loadbalancerId: number,
  data: CreateCertificatePayload
) =>
  Request<Certificate>(
    setURL(
      `${BETA_API_ROOT}/aglb/${encodeURIComponent(loadbalancerId)}/certificates`
    ),
    setMethod('POST'),
    setData(data, CreateCertificateSchema)
  );

/**
 * updateLoadbalancerCertificate
 *
 * Updates an Akamai Global Load Balancer certificate
 */
export const updateLoadbalancerCertificate = (
  loadbalancerId: number,
  certificateId: number,
  data: Partial<CreateCertificatePayload>
) =>
  Request<Certificate>(
    setURL(
      `${BETA_API_ROOT}/aglb/${encodeURIComponent(
        loadbalancerId
      )}/certificates/${encodeURIComponent(certificateId)}`
    ),
    setMethod('PUT'),
    setData(data)
  );

/**
 * deleteLoadbalancerCertificate
 *
 * Deletes an Akamai Global Load Balancer certificate
 */
export const deleteLoadbalancerCertificate = (
  loadbalancerId: number,
  certificateId: number
) =>
  Request<{}>(
    setURL(
      `${BETA_API_ROOT}/aglb/${encodeURIComponent(
        loadbalancerId
      )}/certificates/${encodeURIComponent(certificateId)}`
    ),
    setMethod('DELETE')
  );
