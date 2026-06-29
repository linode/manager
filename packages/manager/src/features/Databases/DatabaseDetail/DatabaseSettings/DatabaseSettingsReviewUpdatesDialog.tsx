import { toast } from '@akamai/cds-components/notification-toast';
import {
  Button,
  Modal,
  NotificationBanner,
} from '@akamai/cds-components/react';
import { getAPIErrorOrDefault } from '@akamai/compute-ui-core/api';
import { usePatchDatabaseMutation } from '@linode/queries';
import * as React from 'react';

import type { Engine, PendingUpdates } from '@linode/api-v4/lib/databases';

interface Props {
  databaseEngine: Engine;
  databaseID: number;
  databasePendingUpdates?: PendingUpdates[];
  onClose: () => void;
  open: boolean;
}

export const DatabaseSettingsReviewUpdatesDialog = (props: Props) => {
  const { databaseEngine, databaseID, databasePendingUpdates, onClose, open } =
    props;

  const { mutateAsync: patchDatabase } = usePatchDatabaseMutation(
    databaseEngine,
    databaseID
  );

  const [error, setError] = React.useState('');
  const [loading, setIsLoading] = React.useState(false);

  const onStartMaintenance = () => {
    setIsLoading(true);
    patchDatabase()
      .then(() => {
        setIsLoading(false);
        toast.open({
          text: 'Database maintenance started successfully.',
          type: 'success',
        });
        onClose();
      })
      .catch((e) => {
        setIsLoading(false);
        setError(
          getAPIErrorOrDefault(e, 'There was an error starting maintenance.')[0]
            .reason
        );
      });
  };

  return (
    <Modal closeModal={onClose} open={open}>
      <span slot="title">Maintenance Updates</span>
      <div slot="body">
        {error ? (
          <NotificationBanner type="error">{error}</NotificationBanner>
        ) : undefined}
        <p>During the maintenance there is a brief service interruption.</p>
        {databasePendingUpdates?.length && (
          <ul>
            {databasePendingUpdates.map((update) => (
              <li key={update.description}>{update.description}</li>
            ))}
          </ul>
        )}
      </div>
      <div slot="actions" style={{ display: 'flex', alignItems: 'center' }}>
        <Button data-testid="close" onClick={onClose} variant="link">
          Close
        </Button>
        <Button
          data-testid="start"
          onClick={onStartMaintenance}
          processing={loading}
          variant="primary"
        >
          Start Maintenance Now
        </Button>
      </div>
    </Modal>
  );
};
