import { Typography } from '@linode/ui';
import React from 'react';

import { useFlags } from 'src/hooks/useFlags';

import { Link } from '../Link';

/**
 * This copy is intended to display where a larger area of data is masked.
 * Example: Billing Contact info, rather than masking many individual fields
 */
export const MaskableTextAreaCopy = () => {
  const { iamRbacPrimaryNavChanges } = useFlags();
  return (
    <Typography>
      This data is sensitive and hidden for privacy. To unmask all sensitive
      data by default, go to{' '}
      <Link
        to={
          iamRbacPrimaryNavChanges
            ? '/profile/preferences'
            : '/profile/settings'
        }
      >
        profile settings
      </Link>
      .
    </Typography>
  );
};
