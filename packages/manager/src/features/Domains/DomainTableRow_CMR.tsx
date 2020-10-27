import { Domain, DomainStatus } from '@linode/api-v4/lib/domains';
import * as React from 'react';
import { Link } from 'react-router-dom';
import { makeStyles, Theme } from 'src/components/core/styles';
import StatusIcon from 'src/components/StatusIcon';
import TableCell from 'src/components/TableCell/TableCell_CMR';
import TableRow from 'src/components/TableRow/TableRow_CMR';
import ActionMenu, { Handlers } from './DomainActionMenu_CMR';
import DateTimeDisplay from 'src/components/DateTimeDisplay';
import Hidden from 'src/components/core/Hidden';

const useStyles = makeStyles((theme: Theme) => ({
  link: {
    display: 'block',
    fontFamily: theme.font.bold,
    lineHeight: '1.125rem',
    textDecoration: 'underline',
    color: theme.cmrTextColors.linkActiveLight
  },
  button: {
    ...theme.applyLinkStyles,
    display: 'block',
    fontFamily: theme.font.bold,
    lineHeight: '1.125rem',
    textDecoration: 'underline'
  },
  domain: {
    width: '60%'
  },
  domainRow: {
    backgroundColor: theme.bg.white
  },
  domainCellContainer: {
    [theme.breakpoints.down('sm')]: {
      textAlign: 'left'
    }
  },
  labelStatusWrapper: {
    display: 'flex',
    flexFlow: 'row nowrap',
    alignItems: 'center',
    whiteSpace: 'nowrap'
  },
  actionCell: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    padding: 0,
    /*
    Explicitly stating this as the theme file is automatically adding padding to the last cell
    We can remove once we make the full switch to CMR styling
    */
    paddingRight: '0 !important'
  }
}));

type CombinedProps = Domain & Handlers;

const DomainTableRow: React.FC<CombinedProps> = props => {
  const {
    domain,
    id,
    type,
    status,
    onDisableOrEnable,
    updated,
    onClone,
    onRemove,
    onEdit
  } = props;

  const classes = useStyles();

  return (
    <TableRow
      key={id}
      data-qa-domain-cell={domain}
      className={`${classes.domainRow} ${'fade-in-table'}`}
      ariaLabel={`Domain ${domain}`}
    >
      <TableCell data-qa-domain-label>
        <div className={classes.labelStatusWrapper}>
          {type !== 'slave' ? (
            <Link to={`/domains/${id}`} tabIndex={0} className={classes.link}>
              {domain}
            </Link>
          ) : (
            <button
              className={classes.button}
              onClick={() => props.onEdit(domain, id)}
            >
              {domain}
            </button>
          )}
        </div>
      </TableCell>
      <TableCell data-qa-domain-status>
        <StatusIcon status={domainStatusToIconStatus(status)} />
        {humanizeDomainStatus(status)}
      </TableCell>
      <Hidden xsDown>
        <TableCell data-qa-domain-type>{type}</TableCell>
        <TableCell data-qa-domain-lastmodified>
          <DateTimeDisplay value={updated} />
        </TableCell>
      </Hidden>

      <TableCell className={classes.actionCell}>
        <ActionMenu
          domain={domain}
          onDisableOrEnable={onDisableOrEnable}
          id={id}
          type={type}
          onRemove={onRemove}
          onClone={onClone}
          status={status}
          onEdit={onEdit}
        />
      </TableCell>
    </TableRow>
  );
};

const humanizeDomainStatus = (status: DomainStatus) => {
  switch (status) {
    case 'active':
      return 'Active';
    case 'disabled':
      return 'Disabled';
    case 'edit_mode':
      return 'Edit Mode';
    case 'has_errors':
      return 'Error';
    default:
      return 'Unknown';
  }
};

const domainStatusToIconStatus = (status: DomainStatus) => {
  switch (status) {
    case 'active':
      return 'active';
    case 'disabled':
      return 'inactive';
    case 'edit_mode':
      return 'inactive';
    case 'has_errors':
      return 'error';
    default:
      return 'inactive';
  }
};

export default React.memo(DomainTableRow);
