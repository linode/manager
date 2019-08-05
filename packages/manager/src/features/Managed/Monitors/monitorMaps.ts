import Disabled from 'src/assets/icons/monitor-disabled.svg';
import Bad from 'src/assets/icons/monitor-failed.svg';
import Good from 'src/assets/icons/monitor-ok.svg';

export const statusIconMap: Record<Linode.MonitorStatus, any> = {
  ok: Good,
  problem: Bad,
  disabled: Disabled,
  pending: Good // @todo need an icon for this
};

export const statusTextMap: Record<Linode.MonitorStatus, string> = {
  ok: 'Verified',
  problem: 'Failed',
  pending: 'Pending',
  disabled: 'Disabled'
};
