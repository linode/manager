import { rescueMetalLinode } from '@linode/api-v4/lib/linodes/actions';
import { useSnackbar } from 'notistack';
import * as React from 'react';

import ActionsPanel from 'src/components/ActionsPanel/ActionsPanel';
import { ConfirmationDialog } from 'src/components/ConfirmationDialog/ConfirmationDialog';
import { useEventsInfiniteQuery } from 'src/queries/events';
import { useLinodeQuery } from 'src/queries/linodes/linodes';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';

import RescueDescription from './RescueDescription';

interface Props {
  isOpen: boolean;
  linodeId: number | undefined;
  onClose: () => void;
}

export const BareMetalRescue = (props: Props) => {
  const { isOpen, linodeId, onClose } = props;
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
    <ActionsPanel
      primaryButtonHandler={handleSubmit}
      primaryButtonLoading={loading}
      primaryButtonText="Reboot into Rescue Mode"
      secondaryButtonDataTestId="cancel"
      secondaryButtonHandler={onClose}
      secondaryButtonText="Cancel"
      showPrimary
      showSecondary
    />
  );

  return (
    <ConfirmationDialog
      actions={actions}
      error={error}
      onClose={onClose}
      open={isOpen}
      title={`Rescue Linode ${linode?.label ?? ''}`}
    >
      {linodeId ? <RescueDescription isBareMetal linodeId={linodeId} /> : null}
    </ConfirmationDialog>
  );
};
