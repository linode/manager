import { Button, Icon } from '@akamai/cds-components/react';
import * as React from 'react';
import type { JSX } from 'react';

import { sendHelpButtonClickEvent } from 'src/utilities/analytics/customEventAnalytics';

export interface DocsLinkProps {
  analyticsLabel?: string;
  href: string;
  icon?: JSX.Element;
  label?: string;
  onClick?: () => void;
  pendoId?: string;
}

export const DocsLink = ({
  analyticsLabel,
  href,
  icon,
  label = 'Docs',
  onClick,
  pendoId,
}: DocsLinkProps) => (
  <Button
    data-pendo-id={pendoId}
    onClick={() => {
      if (onClick === undefined) {
        sendHelpButtonClickEvent(href, analyticsLabel);
      } else {
        onClick();
      }
      window.open(href, '_blank', 'noopener,noreferrer');
    }}
    variant="link"
  >
    {icon ?? <Icon icon="documentation" size="s" />}
    {label}
  </Button>
);
