import { DomainStatus, getDomainRecords } from 'linode-js-sdk/lib/domains';
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
          {retrieveRecords(id)}
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

const retrieveRecords = (domainId: number) => {
  return domainId; // comment this line out and uncomment the below lines when testing; I only added this here to return something and make TypeScript happy on the commit checks.

  // getDomainRecords(domainId)
  //   .then(result => {
  //     const recordUpdateTimes: Array<Date> = [];

  //     result.data.forEach(record => {
  //       const individualRecordUpdateTime = new Date(record.updated + 'Z');
  //       recordUpdateTimes.push(individualRecordUpdateTime);
  //     });

  //     const mostRecentChange = recordUpdateTimes.reduce((a, b) => {
  //       return a > b ? a : b;
  //     });

  //     // console.log(recordUpdateTimes);
  //     // console.log(mostRecentChange);

  //     // return mostRecentChange;
  //     return 'Success';
  //   })
  //   .catch(error => {
  //     return 'Failed';
  //   });
};

const styled = withStyles(styles);

export default styled(DomainTableRow);
