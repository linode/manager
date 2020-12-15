import * as React from 'react';
import VolumeIcon from 'src/assets/icons/entityIcons/volume.svg';
import Typography from 'src/components/core/Typography';
import Currency from 'src/components/Currency';
import Placeholder from 'src/components/Placeholder';
import LinodePermissionsError from '../LinodePermissionsError';
import EnableBackupsDialog from './EnableBackupsDialog';

interface Props {
  backupsMonthlyPrice?: number;
  disabled: boolean;
  linodeId: number;
}

export type CombinedProps = Props;

export const BackupsPlaceholder: React.FC<Props> = props => {
  const { backupsMonthlyPrice, linodeId, disabled } = props;

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
        icon={VolumeIcon}
        isEntity
        title="Backups"
        renderAsSecondary
        buttonProps={[
          {
            onClick: () => setDialogOpen(true),
            children: 'Enable Backups',
            disabled
          }
        ]}
      >
        {backupPlaceholderText}
      </Placeholder>
      <EnableBackupsDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        linodeId={linodeId}
      />
    </>
  );
};

export default React.memo(BackupsPlaceholder);
