import { ManagedLinodeSetting } from '@linode/api-v4/lib/managed';
import * as React from 'react';
import Hidden from 'src/components/core/Hidden';
import { makeStyles } from 'src/components/core/styles';
import TableCell from 'src/components/TableCell/TableCell_CMR';
import TableRow from 'src/components/TableRow/TableRow_CMR';
import ActionMenu from './SSHAccessActionMenu';

const useStyles = makeStyles(() => ({
  actionCell: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    padding: 0,
  },
}));

interface Props {
  linodeSetting: ManagedLinodeSetting;
  updateOne: (linodeSetting: ManagedLinodeSetting) => void;
  openDrawer: (linodeId: number) => void;
}

export const SSHAccessRow: React.FunctionComponent<Props> = props => {
  const classes = useStyles();

  const { linodeSetting, updateOne, openDrawer } = props;

  const isAccessEnabled = linodeSetting.ssh.access;

  return (
    <TableRow
      key={linodeSetting.id}
      data-qa-monitor-cell={linodeSetting.id}
      data-testid={'linode-row'}
      ariaLabel={linodeSetting.label}
    >
      <TableCell data-qa-managed-linode>{linodeSetting.label}</TableCell>
      <TableCell data-qa-managed-ssh-access>
        {isAccessEnabled ? 'Enabled' : 'Disabled'}
      </TableCell>
      <Hidden xsDown>
        <TableCell data-qa-managed-user>{linodeSetting.ssh.user}</TableCell>
        <TableCell data-qa-managed-ip>
          {linodeSetting.ssh.ip === 'any' ? 'Any' : linodeSetting.ssh.ip}
        </TableCell>
        <TableCell data-qa-managed-port>{linodeSetting.ssh.port}</TableCell>
      </Hidden>
      <TableCell className={classes.actionCell}>
        <ActionMenu
          linodeId={linodeSetting.id}
          isEnabled={isAccessEnabled}
          updateOne={updateOne}
          openDrawer={openDrawer}
          linodeLabel={linodeSetting.label}
        />
      </TableCell>
    </TableRow>
  );
};

export default SSHAccessRow;
