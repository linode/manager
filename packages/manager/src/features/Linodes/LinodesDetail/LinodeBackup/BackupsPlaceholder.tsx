import { Typography } from '@linode/ui';
import { styled } from '@mui/material/styles';
import * as React from 'react';

import StorageIcon from 'src/assets/icons/entityIcons/storage.svg';
import { Currency } from 'src/components/Currency';
import { Placeholder } from 'src/components/Placeholder/Placeholder';

import { EnableBackupsDialog } from './EnableBackupsDialog';

import type { PriceObject } from '@linode/api-v4';

interface Props {
  backupsMonthlyPrice?: PriceObject['monthly'];
  disabled: boolean;
  linodeId: number;
  linodeIsInDistributedRegion?: boolean;
}

export const BackupsPlaceholder = React.memo((props: Props) => {
  const {
    backupsMonthlyPrice,
    disabled,
    linodeId,
    linodeIsInDistributedRegion,
  } = props;

  const [dialogOpen, setDialogOpen] = React.useState(false);

  const backupPlaceholderText = backupsMonthlyPrice ? (
    <Typography variant="subtitle1">
      Three backup slots are executed and rotated automatically: a daily backup,
      a 2-7 day old backup, and an 8-14 day old backup. To enable backups for
      just{' '}
      <strong>
        <Currency quantity={backupsMonthlyPrice} /> per month
      </strong>
      , click below.
    </Typography>
  ) : (
    <Typography variant="subtitle1">
      Three backup slots are executed and rotated automatically: a daily backup,
      a 2-7 day old backup, and 8-14 day old backup. To enable backups just
      click below.
    </Typography>
  );

  return (
    <>
      <StyledPlaceholder
        buttonProps={[
          {
            children: 'Enable Backups',
            disabled: disabled || linodeIsInDistributedRegion,
            onClick: () => setDialogOpen(true),
            tooltipText: linodeIsInDistributedRegion
              ? 'Backups are currently not available for distributed regions.'
              : undefined,
          },
        ]}
        data-testid="backups"
        icon={StorageIcon}
        isEntity
        renderAsSecondary
        title="Backups"
      >
        {backupPlaceholderText}
      </StyledPlaceholder>
      <EnableBackupsDialog
        linodeId={linodeId}
        onClose={() => setDialogOpen(false)}
        open={dialogOpen}
      />
    </>
  );
});

const StyledPlaceholder = styled(Placeholder, { label: 'StyledPlaceholder' })({
  '& svg': {
    transform: 'scale(0.75)',
  },
});
