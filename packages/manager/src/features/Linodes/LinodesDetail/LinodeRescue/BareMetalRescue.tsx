import { rescueMetalLinode } from '@linode/api-v4/lib/linodes/actions';
import { useSnackbar } from 'notistack';
import * as React from 'react';
import ActionsPanel from 'src/components/ActionsPanel';
import { Button } from 'src/components/Button/Button';
import { ConfirmationDialog } from 'src/components/ConfirmationDialog/ConfirmationDialog';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';
import RescueDescription from './RescueDescription';
import { useLinodeQuery } from 'src/queries/linodes/linodes';
import { useEventsInfiniteQuery } from 'src/queries/events';

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
  const { resetEventsPolling } = useEventsInfiniteQuery({ enabled: false });

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
    <ActionsPanel>
      <Button buttonType="secondary" onClick={onClose} data-qa-cancel>
        Cancel
      </Button>
      <Button buttonType="primary" onClick={handleSubmit} loading={loading}>
        Reboot into Rescue Mode
      </Button>
    </ActionsPanel>
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
