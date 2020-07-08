import { Domain, DomainStatus } from '@linode/api-v4/lib/domains';
import * as React from 'react';
import { Link } from 'react-router-dom';
import { makeStyles, Theme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import EntityIcon from 'src/components/EntityIcon';
import Grid from 'src/components/Grid';
import TableCell from 'src/components/TableCell';
import TableRow from 'src/components/TableRow';
import ActionMenu, { Handlers } from './DomainActionMenu_CMR';
import DateTimeDisplay from 'src/components/DateTimeDisplay';

const useStyles = makeStyles((theme: Theme) => ({
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
    wordBreak: 'break-all'
  },
  actionCell: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end'
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

  const handleRowClick = (
    e:
      | React.ChangeEvent<HTMLTableRowElement>
      | React.MouseEvent<HTMLAnchorElement, MouseEvent>,
    id: number,
    domain: string,
    type: string
  ) => {
    if (type === 'slave') {
      e.preventDefault();
      props.onEdit(domain, id);
    }
  };

  return (
    <TableRow
      key={id}
      data-qa-domain-cell={domain}
      className={`${classes.domainRow} ${'fade-in-table'}`}
      ariaLabel={`Domain ${domain}`}
      rowLink={
        type === 'slave'
          ? e => handleRowClick(e, id, domain, type)
          : `/domains/${id}`
      }
    >
      <TableCell parentColumn="Domain" data-qa-domain-label>
        <Grid container wrap="nowrap" alignItems="center">
          <Grid item className="py0">
            <EntityIcon
              variant="domain"
              status={status}
              marginTop={1}
              loading={status === 'edit_mode'}
            />
          </Grid>
          <Grid item className={classes.domainCellContainer}>
            <div className={classes.labelStatusWrapper}>
              {type !== 'slave' ? (
                <Link to={`/domains/${id}`} tabIndex={0}>
                  <Typography variant="h3" data-qa-label>
                    {domain}
                  </Typography>
                </Link>
              ) : (
                <Typography variant="h3" data-qa-label>
                  {domain}
                </Typography>
              )}
            </div>
          </Grid>
        </Grid>
      </TableCell>
      <TableCell parentColumn="Type" data-qa-domain-type>
        {type}
      </TableCell>
      <TableCell parentColumn="Status" data-qa-domain-status>
        {humanizeDomainStatus(status)}
      </TableCell>
      <TableCell parentColumn="Last Modified" data-qa-domain-lastmodified>
        <DateTimeDisplay value={updated} />
      </TableCell>
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

export default React.memo(DomainTableRow);
