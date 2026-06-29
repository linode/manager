import type { Status } from './StatusIcon';

export const STATUS_COLORS: Record<Status, string> = {
  active:
    'var(--token-alias-content-icon-positive, light-dark(#00b050, #65ba75))',
  error:
    'var(--token-alias-content-icon-negative, light-dark(#d63c42, #eb9091))',
  inactive:
    'var(--token-alias-content-icon-primary-disabled, light-dark(#a3a3ab, #83838c))',
  other:
    'var(--token-alias-content-icon-warning, light-dark(#fecb34, #edb016))',
};
