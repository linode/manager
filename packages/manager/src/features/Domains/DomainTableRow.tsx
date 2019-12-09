import { DomainStatus } from 'linode-js-sdk/lib/domains';
import * as React from 'react';
import { Link } from 'react-router-dom';
import {
  createStyles,
  Theme,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import EntityIcon from 'src/components/EntityIcon';
import Grid from 'src/components/Grid';
import TableCell from 'src/components/TableCell';
import TableRow from 'src/components/TableRow';
import ActionMenu, { Handlers } from './DomainActionMenu';

type ClassNames =
  | 'domain'
  | 'labelStatusWrapper'
  | 'domainRow'
  | 'domainCellContainer';

const styles = (theme: Theme) =>
  createStyles({
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
    }
  });

interface Props extends Handlers {
  domain: string;
  id: number;
  status: DomainStatus;
  type: 'master' | 'slave';
}

type CombinedProps = Props & WithStyles<ClassNames>;

class DomainTableRow extends React.Component<CombinedProps> {
  handleRowClick = (
    e:
      | React.ChangeEvent<HTMLTableRowElement>
      | React.MouseEvent<HTMLAnchorElement, MouseEvent>,
    id: number,
    domain: string,
    type: string
  ) => {
    if (type === 'slave') {
      e.preventDefault();
      this.props.onEdit(domain, id);
    }
  };

  render() {
    const {
      classes,
      domain,
      id,
      type,
      status,
      onCheck,
      onClone,
      onRemove,
      onEdit
    } = this.props;

    return (
      <TableRow
        key={id}
        data-qa-domain-cell={domain}
        className={`${classes.domainRow} ${'fade-in-table'}`}
        rowLink={
          type === 'slave'
            ? e => this.handleRowClick(e, id, domain, type)
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
                  <Link to={`/domains/${id}`} tabIndex={-1}>
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
        <TableCell>
          <ActionMenu
            domain={domain}
            onDisableOrEnable={this.props.onDisableOrEnable}
            id={id}
            type={type}
            onRemove={onRemove}
            onClone={onClone}
            status={status}
            onEdit={onEdit}
            onCheck={onCheck}
          />
        </TableCell>
      </TableRow>
    );
  }
}

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

const styled = withStyles(styles);

export default styled(DomainTableRow);
