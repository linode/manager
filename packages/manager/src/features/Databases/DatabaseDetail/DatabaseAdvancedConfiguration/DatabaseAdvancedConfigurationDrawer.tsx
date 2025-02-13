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
  const { database, onClose, open } = props;

  const [selectedConfig, setSelectedConfig] = useState('');

  const engineConfigs = database.engine_config;

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
        {engineConfigs ? (
          ''
        ) : (
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
