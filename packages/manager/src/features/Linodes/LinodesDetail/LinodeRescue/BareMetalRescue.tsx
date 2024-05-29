import { rescueMetalLinode } from '@linode/api-v4/lib/linodes/actions';
import { useSnackbar } from 'notistack';
import * as React from 'react';

import { ActionsPanel } from 'src/components/ActionsPanel/ActionsPanel';
import { ConfirmationDialog } from 'src/components/ConfirmationDialog/ConfirmationDialog';
import { useEventsPollingActions } from 'src/queries/events/events';
import { useLinodeQuery } from 'src/queries/linodes/linodes';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';

import { RescueDescription } from './RescueDescription';

interface Props {
  isOpen: boolean;
  linodeId: number | undefined;
  onClose: () => void;
}

export const BareMetalRescue = (props: Props) => {
  const { isOpen, linodeId, onClose } = props;
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<JSX.Element | string>();
  const { enqueueSnackbar } = useSnackbar();
  const { data: linode, isLoading: isLoadingLinodes } = useLinodeQuery(
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
          getAPIErrorOrDefault(err, 'Error booting into rescue mode.')[0]
            .formattedReason
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
      title={`Rescue Linode ${linode?.label ?? ''}`}
    >
      {linodeId ? <RescueDescription isBareMetal linodeId={linodeId} /> : null}
    </ConfirmationDialog>
  );
};
