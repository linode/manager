import { ListItem } from '@mui/material';
import React from 'react';

import { List } from 'src/components/List';
import { Notice } from 'src/components/Notice/Notice';

export const BackupsWarning = () => {
  return (
    <Notice variant="warning">
      <List sx={{ listStyleType: 'disc', pl: 2.5 }}>
        <ListItem sx={{ display: 'list-item', pl: 1, py: '4px' }}>
          This newly created Linode will be created with the same password and
          SSH Keys (if any) as the original Linode.
        </ListItem>
        <ListItem sx={{ display: 'list-item', pl: 1, py: '4px' }}>
          This Linode will need to be manually booted after it finishes
          provisioning.
        </ListItem>
      </List>
    </Notice>
  );
};
