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
      <Typography sx={{ pl: 0.5 }}>
        <strong>{linodeAction} a Linode to a subnet requires:</strong>
      </Typography>
      <List>
        {INTERFACE_WARNINGS.map((notice, idx) => (
          <ListItem key={idx}>{notice.text}</ListItem>
        ))}
      </List>
    </Notice>
  );
};
