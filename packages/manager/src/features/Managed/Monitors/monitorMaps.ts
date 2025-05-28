import Disabled from 'src/assets/icons/monitor-disabled.svg';
import Bad from 'src/assets/icons/monitor-failed.svg';
import Good from 'src/assets/icons/monitor-ok.svg';
import Pending from 'src/assets/icons/pending.svg';

import type { MonitorStatus } from '@linode/api-v4/lib/managed';

export const statusIconMap: Record<MonitorStatus, any> = {
  disabled: Disabled,
  ok: Good,
  pending: Pending,
  problem: Bad,
};

export const statusTextMap: Record<MonitorStatus, string> = {
  disabled: 'Disabled',
  ok: 'Verified',
  pending: 'Pending',
  problem: 'Failed',
};
