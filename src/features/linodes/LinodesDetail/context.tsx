import * as React from 'react';
import { createHOCForConsumer } from 'src/requestableContext';
import {
  CreateLinodeConfigResponse,
  DeleteLinodeConfigResponse,
  GetLinodeConfigResponse,
  GetLinodeConfigsResponse,
  LinodeConfigCreateFields,
  LinodeConfigUpdateFields,
  UpdateLinodeConfigResponse
} from 'src/store/linodes/config/config.actions';
import {
  CreateLinodeDiskResponse,
  DeleteLinodeDiskResponse,
  GetLinodeDiskResponse,
  GetLinodeDisksResponse,
  LinodeDiskCreateFields,
  LinodeDiskUpdateFields,
  ResizeLinodeDiskResponse,
  UpdateLinodeDiskResponse
} from 'src/store/linodes/disk/disk.actions';
import { InnerProps } from './LinodesDetail.container';

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

export interface Context extends InnerProps {
  /** Linode Actions */
  updateLinode: (data: Partial<Linode.Linode>) => Promise<Linode.Linode>;

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

const linodeContext = React.createContext<Context>(null as any);

export const withLinode = createHOCForConsumer<Context>(
  linodeContext.Consumer,
  'WithLinode'
);

export default linodeContext;

export const LinodeProvider = linodeContext.Provider;

export const LinodeConsumer = linodeContext.Consumer;
