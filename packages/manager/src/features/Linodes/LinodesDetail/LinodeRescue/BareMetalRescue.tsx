import { rescueMetalLinode } from '@linode/api-v4/lib/linodes/actions';
import { useLinodeQuery } from '@linode/queries';
import { ActionsPanel } from '@linode/ui';
import { useSnackbar } from 'notistack';
import * as React from 'react';

import { ConfirmationDialog } from 'src/components/ConfirmationDialog/ConfirmationDialog';
import { useEventsPollingActions } from 'src/queries/events/events';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';

import { RescueDescription } from './RescueDescription';

interface Props {
  isOpen: boolean;
  linodeId: number | undefined;
  linodeLabel: string | undefined;
  onClose: () => void;
}

export const BareMetalRescue = (props: Props) => {
  const { isOpen, linodeId, linodeLabel, onClose } = props;
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | undefined>(undefined);
  const { enqueueSnackbar } = useSnackbar();

  const { isLoading: isLoadingLinodes } = useLinodeQuery(
    linodeId ?? -1,
    linodeId !== undefined && isOpen
  );

  const { checkForNewEvents } = useEventsPollingActions();

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
        checkForNewEvents();
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
      primaryButtonProps={{
        'data-qa-form-data-loading': loading || isLoadingLinodes,
        label: 'Reboot into Rescue Mode',
        loading,
        onClick: handleSubmit,
      }}
      secondaryButtonProps={{
        'data-testid': 'cancel',
        label: 'Cancel',
        onClick: onClose,
      }}
    />
  );

  return (
    <ConfirmationDialog
      actions={actions}
      error={error}
      onClose={onClose}
      open={isOpen}
      title={`Rescue Linode ${linodeLabel ?? ''}`}
    >
      {linodeId ? <RescueDescription isBareMetal linodeId={linodeId} /> : null}
    </ConfirmationDialog>
  );
};
