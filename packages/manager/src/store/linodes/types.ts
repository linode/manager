import { LinodeWithMaintenance as L } from './linodes.helpers';

export interface LinodeWithMaintenanceAndDisplayStatus extends L {
  displayStatus?: string;
}
