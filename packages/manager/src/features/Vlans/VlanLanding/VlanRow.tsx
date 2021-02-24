import { VLAN } from '@linode/api-v4/lib/vlans';
import { APIError } from '@linode/api-v4/lib/types';
import * as React from 'react';
import { Link } from 'react-router-dom';
import { compose } from 'recompose';
import { makeStyles, Theme } from 'src/components/core/styles';
import TableCell from 'src/components/TableCell/TableCell_CMR';
import TableRow from 'src/components/TableRow/TableRow_CMR';
import ActionMenu, { ActionHandlers } from './VlanActionMenu';

const useStyles = makeStyles((theme: Theme) => ({
  link: {
    display: 'block',
    fontFamily: theme.font.bold,
    color: theme.cmrTextColors.linkActiveLight,
    fontSize: '.875rem',
    lineHeight: '1.14rem',
    '&:hover, &:focus': {
      textDecoration: 'underline'
    }
  },
  linodesWrapper: {
    padding: '8px 0'
  },
  labelWrapper: {
    display: 'flex',
    flexFlow: 'row nowrap',
    alignItems: 'center',
    whiteSpace: 'nowrap'
  }
}));

export type CombinedProps = VLAN & ActionHandlers;

export const VlanRow: React.FC<CombinedProps> = props => {
  const {
    id,
    description,
    region,
    linodes,
    loading,
    error,
    ...actionHandlers
  } = props;

  const classes = useStyles();

  const getLinodesCellString = (
    vlanLinodes: VLAN['linodes'],
    loading: boolean,
    error?: APIError[]
  ): string | JSX.Element => {
    if (loading) {
      return 'Loading...';
    }

    if (error) {
      return 'Error retrieving Linodes';
    }

    if (vlanLinodes.length === 0) {
      return 'None assigned';
    }

    return getLinodeLinks(vlanLinodes);
  };

  const getLinodeLinks = (vlanLinodes: VLAN['linodes']): JSX.Element => {
    return (
      // eslint-disable-next-line
      <>
        {vlanLinodes.map(thisVLANLinode => (
          <Link
            className={classes.link}
            key={thisVLANLinode.id}
            to={`/linodes/${thisVLANLinode.id}`}
            data-testid="vlan-row-link"
          >
            {/* {getLinodeLabel(thisVLANLinode.id)} */}
          </Link>
        ))}
      </>
    );
  };

  return (
    <TableRow
      key={`vlan-row-${id}`}
      data-testid={`vlan-row-${id}`}
      ariaLabel={`Virtual LAN ${description}`}
    >
      <TableCell>
        <div className={classes.labelWrapper}>
          <Link className={classes.link} to={`/vlans/${id}`}>
            {description}
          </Link>
        </div>
      </TableCell>
      <TableCell>{region}</TableCell>

      <TableCell className={classes.linodesWrapper}>
        {getLinodesCellString(linodes, loading, error)}
      </TableCell>

      <TableCell>
        <ActionMenu vlanID={id} vlanLabel={description} {...actionHandlers} />
      </TableCell>
    </TableRow>
  );
};

export default compose<CombinedProps, ActionHandlers & VLAN>(React.memo)(
  VlanRow
);
