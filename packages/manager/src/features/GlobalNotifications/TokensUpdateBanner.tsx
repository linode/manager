import { Typography } from '@linode/ui';
import * as React from 'react';

import { DismissibleBanner } from 'src/components/DismissibleBanner/DismissibleBanner';
import { Link } from 'src/components/Link';
import { useFlags } from 'src/hooks/useFlags';

import type { NoticeProps } from '@linode/ui';

type DesignUpdateBannerProps = Partial<NoticeProps>;

export const DesignUpdateBanner = ({ ...rest }: DesignUpdateBannerProps) => {
  const flags = useFlags();
  const designUpdateFlag = flags.cloudManagerDesignUpdatesBanner;

  if (!designUpdateFlag || !designUpdateFlag.enabled) {
    return null;
  }
  const { key, link } = designUpdateFlag;

  /**
   * This banner is a reusable banner for future Cloud Manager design updates.
   * Since this banner is dismissible, we want to be able to dynamically change the key,
   * so we can show it again as needed to users who have dismissed it in the past in the case of a new series of UI updates.
   *
   * Flag shape is as follows:
   *
   *  {
   *    "enabled": boolean,
   *    "key": "some-key",
   *    "link": "link to docs"
   *  }
   *
   */
  return (
    <DismissibleBanner preferenceKey={key} variant="info" {...rest}>
      <Typography fontSize="inherit">
        We are improving the Cloud Manager experience for our users.{' '}
        <Link to={link}>Read more</Link> about recent updates.
      </Typography>
    </DismissibleBanner>
  );
};
