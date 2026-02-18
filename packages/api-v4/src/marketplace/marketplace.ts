import { createPartnerReferralSchema } from '@linode/validation';

import { BETA_API_ROOT } from 'src/constants';
import Request, { setData, setMethod, setURL } from 'src/request';

import type { MarketplacePartnerReferralPayload } from './types';

export const createPartnerReferral = (
  data: MarketplacePartnerReferralPayload,
) =>
  Request<{}>(
    setURL(`${BETA_API_ROOT}/marketplace/contact`),
    setMethod('POST'),
    setData(data, createPartnerReferralSchema),
  );
