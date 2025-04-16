import { List, ListItem, Notice, Typography } from '@linode/ui';
import * as React from 'react';

interface Props {
  linodeAction: 'Assigning' | 'Unassigning';
}

const INTERFACE_WARNINGS = [
  {
    text: 'Linodes with Linode Interfaces to be shut down and powered on after changes.',
  },
  {
    text: 'Linodes with Configuration Profile Interfaces to be rebooted after changes.',
  },
];

export const SubnetLinodeActionNotice = (props: Props) => {
  const { linodeAction } = props;
  return (
    <Notice
      data-testid="subnet-linode-action-notice"
      spacingBottom={16}
      variant="warning"
    >
      <Typography component="span" sx={{ pl: 1, py: 1, fontSize: '0.875rem' }}>
        <strong>{linodeAction} a Linode to a subnet requires:</strong>
        <List
          dense
          sx={{
            listStyleType: 'disc',
            pl: 3,
          }}
        >
          {INTERFACE_WARNINGS.map((notice, idx) => (
            <ListItem
              disablePadding
              key={idx}
              sx={{
                display: 'list-item',
              }}
            >
              {notice.text}
            </ListItem>
          ))}
        </List>
      </Typography>
    </Notice>
  );
};
