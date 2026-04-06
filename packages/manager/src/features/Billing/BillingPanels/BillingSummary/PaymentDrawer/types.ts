import type { APIWarning } from '@linode/api-v4/lib/types';
export type SetSuccess = (
  message: null | string,
  paymentWasMade?: boolean,
  warning?: APIWarning[]
) => void;
