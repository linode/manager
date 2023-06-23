import { Linode } from '@linode/api-v4/lib/linodes';
import * as React from 'react';
import { createHOCForConsumer } from 'src/requestableContext';
import {
  CreateLinodeConfigResponse,
  DeleteLinodeConfigResponse,
  GetLinodeConfigResponse,
  GetLinodeConfigsResponse,
  LinodeConfigCreateFields,
  LinodeConfigUpdateFields,
  UpdateLinodeConfigResponse,
} from 'src/store/linodes/config/config.actions';
import {
  createLinodeConfig as _createLinodeConfig,
  deleteLinodeConfig as _deleteLinodeConfig,
  getLinodeConfig as _getLinodeConfig,
  getLinodeConfigs as _getLinodeConfigs,
  updateLinodeConfig as _updateLinodeConfig,
} from 'src/store/linodes/config/config.requests';
import {
  CreateLinodeDiskResponse,
  DeleteLinodeDiskResponse,
  GetLinodeDiskResponse,
  GetLinodeDisksResponse,
  LinodeDiskCreateFields,
  LinodeDiskUpdateFields,
  ResizeLinodeDiskResponse,
  UpdateLinodeDiskResponse,
} from 'src/store/linodes/disk/disk.actions';
import {
  createLinodeDisk as _createLinodeDisk,
  deleteLinodeDisk as _deleteLinodeDisk,
  getLinodeDisk as _getLinodeDisk,
  getLinodeDisks as _getLinodeDisks,
  resizeLinodeDisk as _resizeLinodeDisk,
  updateLinodeDisk as _updateLinodeDisk,
} from 'src/store/linodes/disk/disk.requests';
import { updateLinode as _updateLinode } from 'src/store/linodes/linode.requests';
import { ThunkDispatch } from 'src/store/types';
import { ExtendedLinode } from './types';

export type CreateLinodeConfig = (
  data: LinodeConfigCreateFields
) => CreateLinodeConfigResponse;

export type DeleteLinodeConfig = (
  configId: number
) => DeleteLinodeConfigResponse;

export type GetLinodeConfig = (configId: number) => GetLinodeConfigResponse;

export type GetLinodeConfigs = () => GetLinodeConfigsResponse;

export type UpdateLinodeConfig = (
  configId: number,
  data: LinodeConfigUpdateFields
) => UpdateLinodeConfigResponse;

export type CreateLinodeDisk = (
  data: LinodeDiskCreateFields
) => CreateLinodeDiskResponse;

export type DeleteLinodeDisk = (diskId: number) => DeleteLinodeDiskResponse;

export type ResizeLinodeDisk = (
  diskId: number,
  size: number
) => ResizeLinodeDiskResponse;

export type GetLinodeDisk = (diskId: number) => GetLinodeDiskResponse;

export type GetLinodeDisks = () => GetLinodeDisksResponse;

export type UpdateLinodeDisk = (
  diskId: number,
  data: LinodeDiskUpdateFields
) => UpdateLinodeDiskResponse;

export type UpdateLinode = (data: Partial<Linode>) => Promise<Linode>;

export interface LinodeDetailContext {
  linode: ExtendedLinode;

  /** Linode Actions */
  updateLinode: (data: Partial<Linode>) => Promise<Linode>;

  /** Linode Config actions */
  createLinodeConfig: CreateLinodeConfig;
  deleteLinodeConfig: DeleteLinodeConfig;
  getLinodeConfig: GetLinodeConfig;
  getLinodeConfigs: GetLinodeConfigs;
  updateLinodeConfig: UpdateLinodeConfig;

  /** Linode Disk actions */
  createLinodeDisk: CreateLinodeDisk;
  deleteLinodeDisk: DeleteLinodeDisk;
  getLinodeDisk: GetLinodeDisk;
  getLinodeDisks: GetLinodeDisks;
  updateLinodeDisk: UpdateLinodeDisk;
  resizeLinodeDisk: ResizeLinodeDisk;
}

/**
 * Create the Linode Detail Context including handlers pre-configured with the
 * required Linode ID.
 */
export const linodeDetailContextFactory = (
  linode: ExtendedLinode,
  dispatch: ThunkDispatch
): LinodeDetailContext => {
  const { id: linodeId } = linode;

  return {
    createLinodeConfig: (data) =>
      dispatch(_createLinodeConfig({ linodeId, ...data })),

    createLinodeDisk: (data) =>
      dispatch(_createLinodeDisk({ linodeId, ...data })),
    deleteLinodeConfig: (configId) =>
      dispatch(_deleteLinodeConfig({ configId, linodeId })),
    deleteLinodeDisk: (diskId) =>
      dispatch(_deleteLinodeDisk({ diskId, linodeId })),
    /** Linode Config actions */
    getLinodeConfig: (configId) =>
      dispatch(_getLinodeConfig({ configId, linodeId })),
    getLinodeConfigs: () =>
      dispatch(_getLinodeConfigs({ linodeId })).then(({ data }) => data),

    /** Linode Disk actions */
    getLinodeDisk: (diskId) => dispatch(_getLinodeDisk({ diskId, linodeId })),
    getLinodeDisks: () => dispatch(_getLinodeDisks({ linodeId })),
    linode,
    resizeLinodeDisk: (diskId, size) =>
      dispatch(_resizeLinodeDisk({ diskId, linodeId, size })),
    updateLinode: (data: Partial<Linode>) =>
      dispatch(_updateLinode({ linodeId, ...data })),
    updateLinodeConfig: (configId, data) =>
      dispatch(_updateLinodeConfig({ configId, linodeId, ...data })),
    updateLinodeDisk: (diskId, data) =>
      dispatch(_updateLinodeDisk({ diskId, linodeId, ...data })),
  };
};

const linodeContext = React.createContext<LinodeDetailContext>(null as any);

export default linodeContext;

export const LinodeDetailContextProvider = linodeContext.Provider;

export const LinodeDetailContextConsumer = linodeContext.Consumer;

export const withLinodeDetailContext = createHOCForConsumer<LinodeDetailContext>(
  linodeContext.Consumer,
  'withLinodeDetailContext'
);
