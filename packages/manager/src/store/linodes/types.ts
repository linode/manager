import { LinodeWithMaintenance as L } from './linodes.helpers';

/* tslint:disable-next-line */
export interface LinodeWithMaintenance extends L {}

export interface LinodeWithMaintenanceAndDisplayStatus
  extends LinodeWithMaintenance {
  displayStatus?: string;
}
