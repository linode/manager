import { List, Notice } from '@linode/ui';
import { ListItem } from '@mui/material';
import React from 'react';

export const CloneWarning = () => {
  return (
    <Notice variant="warning">
      <List>
        <ListItem>
          To help <strong>avoid data corruption</strong> during the cloning
          process, we recommend powering off your Compute Instance prior to
          cloning.
        </ListItem>
        <ListItem>
          This newly created Linode will be created with the same password and
          SSH Keys (if any) as the original Linode.
        </ListItem>
      </List>
    </Notice>
  );
};
