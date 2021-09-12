import { MonitorStatus } from '@linode/api-v4/lib/managed';
import Disabled from 'src/assets/icons/monitor-disabled.svg?component';
import Bad from 'src/assets/icons/monitor-failed.svg?component';
import Good from 'src/assets/icons/monitor-ok.svg?component';
import Pending from 'src/assets/icons/pending.svg?component';

export const statusIconMap: Record<MonitorStatus, any> = {
  ok: Good,
  problem: Bad,
  disabled: Disabled,
  pending: Pending,
};

export const statusTextMap: Record<MonitorStatus, string> = {
  ok: 'Verified',
  problem: 'Failed',
  pending: 'Pending',
  disabled: 'Disabled',
};
