import { LinodeWithMaintenance as L } from './linodes.helpers';

/* tslint:disable-next-line */
export interface LinodeWithMaintenance extends L {}

export interface LinodeWithMaintenanceAndMostRecentBackup
  extends LinodeWithMaintenance {
  mostRecentBackup?: string | null;
}
