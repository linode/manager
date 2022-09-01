import { Domain, DomainStatus } from '@linode/api-v4/lib/domains';
import * as React from 'react';
import { Link } from 'react-router-dom';
import Hidden from 'src/components/core/Hidden';
import { makeStyles, Theme } from 'src/components/core/styles';
import DateTimeDisplay from 'src/components/DateTimeDisplay';
import StatusIcon from 'src/components/StatusIcon';
import TableCell from 'src/components/TableCell';
import TableRow from 'src/components/TableRow';
import ActionMenu, { Handlers } from './DomainActionMenu';
import { getDomainDisplayType } from './domainUtils';

const useStyles = makeStyles((theme: Theme) => ({
  button: {
    ...theme.applyLinkStyles,
  },
  labelStatusWrapper: {
    display: 'flex',
    flexFlow: 'row nowrap',
    alignItems: 'center',
    whiteSpace: 'nowrap',
  },
}));

type CombinedProps = { domain: Domain } & Handlers;

const DomainTableRow: React.FC<CombinedProps> = (props) => {
  const { domain, onDisableOrEnable, onClone, onRemove, onEdit } = props;

  const classes = useStyles();

  return (
    <TableRow
      key={domain.id}
      data-qa-domain-cell={domain.domain}
      ariaLabel={`Domain ${domain.domain}`}
    >
      <TableCell data-qa-domain-label>
        <div className={classes.labelStatusWrapper}>
          {domain.type !== 'slave' ? (
            <Link to={`/domains/${domain.id}`} tabIndex={0}>
              {domain.domain}
            </Link>
          ) : (
            <button
              className={classes.button}
              onClick={() => props.onEdit(domain)}
            >
              {domain.domain}
            </button>
          )}
        </div>
      </TableCell>
      <TableCell statusCell data-qa-domain-status>
        <StatusIcon status={domainStatusToIconStatus(domain.status)} />
        {humanizeDomainStatus(domain.status)}
      </TableCell>
      <Hidden xsDown>
        <TableCell data-qa-domain-type>
          {getDomainDisplayType(domain.type)}
        </TableCell>
        <TableCell data-qa-domain-lastmodified>
          <DateTimeDisplay value={domain.updated} />
        </TableCell>
      </Hidden>
      <TableCell actionCell>
        <ActionMenu
          domain={domain}
          onDisableOrEnable={onDisableOrEnable}
          onRemove={onRemove}
          onClone={onClone}
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
