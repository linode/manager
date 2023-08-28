import { styled } from '@mui/material/styles';
import * as React from 'react';

import VolumeIcon from 'src/assets/icons/entityIcons/volume.svg';
import { Currency } from 'src/components/Currency';
import { Placeholder } from 'src/components/Placeholder/Placeholder';
import { Typography } from 'src/components/Typography';

import { LinodePermissionsError } from '../LinodePermissionsError';
import { EnableBackupsDialog } from './EnableBackupsDialog';

interface Props {
  backupsMonthlyPrice?: number;
  disabled: boolean;
  linodeId: number;
}

export const BackupsPlaceholder = React.memo((props: Props) => {
  const { backupsMonthlyPrice, disabled, linodeId } = props;

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
      {disabled && <LinodePermissionsError />}
      <StyledPlaceholder
        buttonProps={[
          {
            children: 'Enable Backups',
            disabled,
            onClick: () => setDialogOpen(true),
          },
        ]}
        icon={VolumeIcon}
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
