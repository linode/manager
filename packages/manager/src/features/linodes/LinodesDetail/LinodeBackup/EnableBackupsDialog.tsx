import { enableBackups } from '@linode/api-v4/lib/linodes';
import { useSnackbar } from 'notistack';
import * as React from 'react';
import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import Typography from 'src/components/core/Typography';
import ConfirmationDialog from 'src/components/ConfirmationDialog';
import Currency from 'src/components/Currency';
import Notice from 'src/components/Notice';
import { resetEventsPolling } from 'src/eventsPolling';
import useLinodes from 'src/hooks/useLinodes';
import { useTypes } from 'src/hooks/useTypes';

interface Props {
  linodeId: number;
  onClose: () => void;
  open: boolean;
}

export type CombinedProps = Props;

export const EnableBackupsDialog: React.FC<Props> = props => {
  const { linodeId, onClose, open } = props;
  /**
   * Calculate the monthly backup price here.
   * Since this component is used in LinodesLanding
   * as well as detail, can't rely on parents knowing
   * this information.
   */
  const { types } = useTypes({
    includeShadowPlans: true,
    includeDeprecatedTypes: true
  });
  const { linodes } = useLinodes();
  const thisLinode = linodes.itemsById[linodeId];
  const thisLinodeType = types.entities.find(
    thisType => thisType.id === thisLinode?.type
  );

  const price = thisLinodeType?.addons.backups.price.monthly ?? 0;

  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | undefined>();

  const { enqueueSnackbar } = useSnackbar();

  const handleEnableBackups = React.useCallback(() => {
    setSubmitting(true);
    enableBackups(linodeId)
      .then(() => {
        setSubmitting(false);
        resetEventsPolling();
        enqueueSnackbar('Backups are being enabled for this Linode.', {
          variant: 'success'
        });
        onClose();
      })
      .catch(error => {
        setError(error[0].reason);
        setSubmitting(false);
      });
  }, [linodeId, onClose, enqueueSnackbar]);

  React.useEffect(() => {
    if (open) {
      setError(undefined);
    }
  }, [open]);

  const actions = React.useMemo(() => {
    return (
      <ActionsPanel style={{ padding: 0 }}>
        <Button buttonType="cancel" onClick={onClose} data-qa-cancel-cancel>
          Close
        </Button>
        <Button
          buttonType="secondary"
          loading={submitting}
          onClick={handleEnableBackups}
          data-qa-confirm-enable-backups
        >
          Enable Backups
        </Button>
      </ActionsPanel>
    );
  }, [onClose, submitting, handleEnableBackups]);

  return (
    <ConfirmationDialog
      title="Enable backups?"
      actions={actions}
      open={open}
      onClose={onClose}
    >
      <>
        <Typography>
          Are you sure you want to enable backups on this Linode?{` `}
          This will add <Currency quantity={price} />
          {` `}
          to your monthly bill.
        </Typography>
        {error && <Notice error text={error} spacingTop={8} />}
      </>
    </ConfirmationDialog>
  );
};

export default React.memo(EnableBackupsDialog);
