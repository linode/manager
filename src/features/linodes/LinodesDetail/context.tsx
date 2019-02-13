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

export interface Context extends InnerProps {
  /** Linode Actions */
  updateLinode: (data: Partial<Linode.Linode>) => Promise<Linode.Linode>;

  /** Linode Disk Actions */
  createLinodeConfig: CreateLinodeConfig;
  deleteLinodeConfig: DeleteLinodeConfig;
  getLinodeConfig: GetLinodeConfig;
  getLinodeConfigs: GetLinodeConfigs;
  updateLinodeConfig: UpdateLinodeConfig;
}

const linodeContext = React.createContext<Context>(null as any);

export const withLinode = createHOCForConsumer<Context>(
  linodeContext.Consumer,
  'WithLinode'
);

export default linodeContext;

export const LinodeProvider = linodeContext.Provider;

export const LinodeConsumer = linodeContext.Consumer;
