import { MonitorStatus } from 'linode-js-sdk/lib/managed';
import Disabled from 'src/assets/icons/monitor-disabled.svg';
import Bad from 'src/assets/icons/monitor-failed.svg';
import Good from 'src/assets/icons/monitor-ok.svg';
import Pending from 'src/assets/icons/pending.svg';

export const statusIconMap: Record<MonitorStatus, any> = {
  ok: Good,
  problem: Bad,
  disabled: Disabled,
  pending: Pending
};

export const statusTextMap: Record<MonitorStatus, string> = {
  ok: 'Verified',
  problem: 'Failed',
  pending: 'Pending',
  disabled: 'Disabled'
};
