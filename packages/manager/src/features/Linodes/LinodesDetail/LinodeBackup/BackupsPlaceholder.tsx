import * as React from 'react';
import { makeStyles } from 'tss-react/mui';

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

const useStyles = makeStyles()(() => ({
  empty: {
    '& svg': {
      transform: 'scale(0.75)',
    },
  },
}));

export const BackupsPlaceholder = (props: Props) => {
  const { classes } = useStyles();

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
      <Placeholder
        buttonProps={[
          {
            children: 'Enable Backups',
            disabled,
            onClick: () => setDialogOpen(true),
          },
        ]}
        className={classes.empty}
        icon={VolumeIcon}
        isEntity
        renderAsSecondary
        title="Backups"
      >
        {backupPlaceholderText}
      </Placeholder>
      <EnableBackupsDialog
        linodeId={linodeId}
        onClose={() => setDialogOpen(false)}
        open={dialogOpen}
      />
    </>
  );
};

export default React.memo(BackupsPlaceholder);
