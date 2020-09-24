import * as React from 'react';
import { Link } from 'react-router-dom';
import { compose } from 'recompose';
import { makeStyles, Theme } from 'src/components/core/styles';
import TableCell from 'src/components/TableCell';
import TableRow from 'src/components/TableRow';
import ActionMenu, { ActionHandlers } from './VlanActionMenu';

const useStyles = makeStyles((theme: Theme) => ({
  link: {
    display: 'block',
    fontFamily: theme.font.bold,
    fontSize: '.875rem',
    lineHeight: '1.125rem',
    textDecoration: 'underline'
  },
  labelWrapper: {
    display: 'flex',
    flexFlow: 'row nowrap',
    alignItems: 'center',
    whiteSpace: 'nowrap'
  }
}));

//TODO remove and add SDK version once its in place
interface VLAN {
  id: number;
  label: string;
  region: string;
  linodes: string[];
}

export type CombinedProps = VLAN & ActionHandlers;

export const VlanRow: React.FC<CombinedProps> = props => {
  const { id, label, region, linodes, ...actionHandlers } = props;

  const classes = useStyles();

  return (
    <TableRow
      key={`vlan-row-${id}`}
      data-testid={`vlan-row-${id}`}
      ariaLabel={`Virtual LAN ${label}`}
    >
      <TableCell>
        <div className={classes.labelWrapper}>
          <Link className={classes.link} to={`/vlans/${id}`}>
            {label}
          </Link>
        </div>
      </TableCell>
      <TableCell>{region}</TableCell>

      {/* TODO need to listify this */}
      <TableCell>{linodes}</TableCell>

      <TableCell>
        <ActionMenu vlanID={id} vlanLabel={label} {...actionHandlers} />
      </TableCell>
    </TableRow>
  );
};

export default compose<CombinedProps, ActionHandlers>(React.memo)(VlanRow);
