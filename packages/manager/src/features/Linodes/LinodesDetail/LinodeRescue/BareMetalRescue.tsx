import { rescueMetalLinode } from '@linode/api-v4/lib/linodes/actions';
import { useSnackbar } from 'notistack';
import * as React from 'react';
import ActionsPanel from 'src/components/ActionsPanel/ActionsPanel';
import { ConfirmationDialog } from 'src/components/ConfirmationDialog/ConfirmationDialog';
import { resetEventsPolling } from 'src/eventsPolling';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';
import RescueDescription from './RescueDescription';
import { useLinodeQuery } from 'src/queries/linodes/linodes';

interface Props {
  linodeId: number | undefined;
  isOpen: boolean;
  onClose: () => void;
}

export const BareMetalRescue = (props: Props) => {
  const { isOpen, onClose, linodeId } = props;
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | undefined>(undefined);
  const { enqueueSnackbar } = useSnackbar();
  const { data: linode } = useLinodeQuery(
    linodeId ?? -1,
    linodeId !== undefined && isOpen
  );

  React.useEffect(() => {
    if (isOpen) {
      setError(undefined);
      setLoading(false);
    }
  }, [isOpen]);

  const handleSubmit = () => {
    setError(undefined);
    setLoading(true);
    rescueMetalLinode(linodeId ?? -1)
      .then(() => {
        setLoading(false);
        enqueueSnackbar('Linode rescue started.', {
          variant: 'info',
        });
        resetEventsPolling();
        onClose();
      })
      .catch((err) => {
        setLoading(false);
        setError(
          getAPIErrorOrDefault(err, 'Error booting into rescue mode.')[0].reason
        );
      });
  };

  const actions = () => (
    <ActionsPanel
      primary
      primaryButtonHandler={handleSubmit}
      primaryButtonLoading={loading}
      primaryButtonText="Reboot into Rescue Mode"
      secondary
      secondaryButtonDataTestId="cancel"
      secondaryButtonHandler={onClose}
      secondaryButtonText="Cancel"
    />
  );

  return (
    <ConfirmationDialog
      title={`Rescue Linode ${linode?.label ?? ''}`}
      open={isOpen}
      onClose={onClose}
      actions={actions}
      error={error}
    >
      {linodeId ? <RescueDescription linodeId={linodeId} isBareMetal /> : null}
    </ConfirmationDialog>
  );
};
