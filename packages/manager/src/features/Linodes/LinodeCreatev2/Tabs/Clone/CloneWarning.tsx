import { ListItem } from '@mui/material';
import React from 'react';

import { List } from 'src/components/List';
import { Notice } from 'src/components/Notice/Notice';

export const CloneWarning = () => {
  return (
    <Notice variant="warning">
      <List sx={{ listStyleType: 'disc', pl: 2.5 }}>
        <ListItem sx={{ display: 'list-item', pl: 1, py: 0.5 }}>
          This newly created Linode will be created with the same password and
          SSH Keys (if any) as the original Linode.
        </ListItem>
        <ListItem sx={{ display: 'list-item', pl: 1, py: 0.5 }}>
          To help avoid data corruption during the cloning process, we recommend
          powering off your Compute Instance prior to cloning.
        </ListItem>
      </List>
    </Notice>
  );
};
