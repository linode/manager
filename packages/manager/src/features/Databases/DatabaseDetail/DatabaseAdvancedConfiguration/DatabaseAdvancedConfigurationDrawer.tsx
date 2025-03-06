import { Divider, Notice, Typography } from '@linode/ui';
import React, { useState } from 'react';

import { ActionsPanel } from 'src/components/ActionsPanel/ActionsPanel';
import { Drawer } from 'src/components/Drawer';
import { Link } from 'src/components/Link';

import { DatabaseConfigurationSelect } from './DatabaseConfigurationSelect';

import type { Database, DatabaseInstance } from '@linode/api-v4';

interface Props {
  database: Database | DatabaseInstance;
  onClose: () => void;
  open: boolean;
}

export const DatabaseAdvancedConfigurationDrawer = (props: Props) => {
  const { onClose, open } = props;

  const [selectedConfig, setSelectedConfig] = useState('');

  // const engineConfigs = database.engine_config;
  // Placeholder for engine configurations (currently set to 'undefined' as the UI is not ready yet).
  // The implementation will be updated in the second PR after UI work is completed.
  const engineConfigs = undefined;
  return (
    <Drawer onClose={onClose} open={open} title="Advanced Configuration">
      <Typography>
        Advanced parameters to configure your database cluster.
      </Typography>
      <Link to="">Learn more.</Link>

      <Notice important top={24} variant="info">
        <Typography>
          There is no way to reset advanced configuration options to default.
          Options that you add cannot be removed. Changing or adding some
          options causes the service to restart.
        </Typography>
      </Notice>
      <form>
        <DatabaseConfigurationSelect
          configurations={[]}
          errorText={undefined}
          onChange={(config) => setSelectedConfig(config)}
          value={selectedConfig}
        />

        <Divider spacingBottom={20} spacingTop={24} />
        {!engineConfigs && (
          <Typography align="center">
            No advanced configurations have been added.
          </Typography>
        )}
        <Divider spacingBottom={20} spacingTop={24} />
        <ActionsPanel
          primaryButtonProps={{
            label: 'Save and Restart Service',
            type: 'submit',
          }}
          secondaryButtonProps={{
            label: 'Cancel',
            onClick: onClose,
          }}
        />
      </form>
    </Drawer>
  );
};
