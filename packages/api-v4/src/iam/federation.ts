import { BETA_API_ROOT } from '../constants';
import Request, {
  setData,
  setMethod,
  setParams,
  setURL,
  setXFilter,
} from '../request';

import type { ResourcePage as Page } from '../types';
import type {
  CreateIdpCertificatePayload,
  CreateIdpConfigPayload,
  GetIdpCertificatesParams,
  GetIdpConfigsParams,
  GetIdpConfigUsersParams,
  IdpCertificate,
  IdpConfig,
  IdpUser,
  UpdateIdpConfigPayload,
  UpdateIdpUsersPayload,
} from './federation.types';

export const getIdpConfigs = ({ params, filter }: GetIdpConfigsParams = {}) =>
  Request<Page<IdpConfig>>(
    setURL(`${BETA_API_ROOT}/iam/idp-configs`),
    setMethod('GET'),
    setParams(params),
    setXFilter(filter),
  );

export const getIdpConfig = (euuid: string) =>
  Request<IdpConfig>(
    setURL(`${BETA_API_ROOT}/iam/idp-configs/${encodeURIComponent(euuid)}`),
    setMethod('GET'),
  );

export const createIdpConfig = (data: CreateIdpConfigPayload) =>
  Request<IdpConfig>(
    setURL(`${BETA_API_ROOT}/iam/idp-configs`),
    setMethod('POST'),
    setData(data),
  );

export const updateIdpConfig = (euuid: string, data: UpdateIdpConfigPayload) =>
  Request<IdpConfig>(
    setURL(`${BETA_API_ROOT}/iam/idp-configs/${encodeURIComponent(euuid)}`),
    setMethod('PUT'),
    setData(data),
  );

export const deleteIdpConfig = (euuid: string) =>
  Request<object>(
    setURL(`${BETA_API_ROOT}/iam/idp-configs/${encodeURIComponent(euuid)}`),
    setMethod('DELETE'),
  );

export const getIdpConfigUsersExcluded = ({
  euuid,
  params,
  filter,
}: GetIdpConfigUsersParams) =>
  Request<Page<IdpUser>>(
    setURL(
      `${BETA_API_ROOT}/iam/idp-configs/${encodeURIComponent(euuid)}/users-excluded`,
    ),
    setMethod('GET'),
    setParams(params),
    setXFilter(filter),
  );

export const getIdpConfigUsersIncluded = ({
  euuid,
  params,
  filter,
}: GetIdpConfigUsersParams) =>
  Request<Page<IdpUser>>(
    setURL(
      `${BETA_API_ROOT}/iam/idp-configs/${encodeURIComponent(euuid)}/users-included`,
    ),
    setMethod('GET'),
    setParams(params),
    setXFilter(filter),
  );

export const updateIdpConfigUsersExcluded = (
  euuid: string,
  data: UpdateIdpUsersPayload,
) =>
  Request<Page<IdpUser>>(
    setURL(
      `${BETA_API_ROOT}/iam/idp-configs/${encodeURIComponent(euuid)}/users-excluded`,
    ),
    setMethod('PUT'),
    setData(data),
  );

export const updateIdpConfigUsersIncluded = (
  euuid: string,
  data: UpdateIdpUsersPayload,
) =>
  Request<Page<IdpUser>>(
    setURL(
      `${BETA_API_ROOT}/iam/idp-configs/${encodeURIComponent(euuid)}/users-included`,
    ),
    setMethod('PUT'),
    setData(data),
  );

export const getIdpCertificates = ({
  euuid,
  params,
}: GetIdpCertificatesParams) =>
  Request<Page<IdpCertificate>>(
    setURL(
      `${BETA_API_ROOT}/iam/idp-configs/${encodeURIComponent(euuid)}/certificates`,
    ),
    setMethod('GET'),
    setParams(params),
  );

export const createIdpCertificate = (
  euuid: string,
  data: CreateIdpCertificatePayload,
) =>
  Request<IdpCertificate>(
    setURL(
      `${BETA_API_ROOT}/iam/idp-configs/${encodeURIComponent(euuid)}/certificates`,
    ),
    setMethod('POST'),
    setData(data),
  );

export const deleteIdpCertificate = (euuid: string, id: string) =>
  Request<{}>(
    setURL(
      `${BETA_API_ROOT}/iam/idp-configs/${encodeURIComponent(euuid)}/certificates/${encodeURIComponent(id)}`,
    ),
    setMethod('DELETE'),
  );
