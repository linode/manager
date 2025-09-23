import { Box, LinkButton, TooltipIcon, Typography, useTheme } from '@linode/ui';
import * as React from 'react';

import { Link } from 'src/components/Link';

import type { Volume } from '@linode/api-v4';

interface Props {
  onDetach?: () => void;
  volume: Volume;
}

export const AttachedToValue = ({ onDetach, volume }: Props) => {
  const theme = useTheme();

  if (volume.linode_label !== null && volume.linode_id !== null) {
    return (
      <Box sx={{ display: 'flex', gap: theme.spacingFunction(8) }}>
        <Link
          params={{ linodeId: volume.linode_id }}
          to="/linodes/$linodeId/storage"
        >
          {volume.linode_label}
        </Link>

        {onDetach && (
          <>
            | <LinkButton onClick={onDetach}>Detach</LinkButton>
          </>
        )}
      </Box>
    );
  }

  if (volume.linode_label === null && volume.io_ready) {
    return (
      <Box alignItems="center" display="flex" gap={theme.spacingFunction(4)}>
        <Typography color={theme.tokens.color.Neutrals[30]} data-qa-restricted>
          Linode (restricted)
        </Typography>
        <TooltipIcon
          data-qa-tooltip-restricted
          status="info"
          sxTooltipIcon={{ padding: 0 }}
          text="Contact your account manager to change permissions."
          tooltipPosition="right"
        />
      </Box>
    );
  }

  return <Typography data-qa-unattached>Unattached</Typography>;
};
