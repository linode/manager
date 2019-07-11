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
import {} from 'src/components/StatusIndicator';
import TableCell from 'src/components/TableCell';
import TableRow from 'src/components/TableRow';
import Tags from 'src/components/Tags';
import ActionMenu from './DomainActionMenu';

type ClassNames =
  | 'domain'
  | 'labelStatusWrapper'
  | 'tagWrapper'
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
    },
    tagWrapper: {
      marginTop: theme.spacing(1) / 2,
      '& [class*="MuiChip"]': {
        cursor: 'pointer'
      }
    }
  });

interface Props {
  domain: string;
  id: number;
  tags: string[];
  status: string;
  type: 'master' | 'slave';
  onRemove: (domain: string, domainId: number) => void;
  onClone: (domain: string, id: number) => void;
  onEdit: (domain: string, id: number) => void;
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
      tags,
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
              <div className={classes.tagWrapper}>
                <Tags tags={tags} />
              </div>
            </Grid>
          </Grid>
        </TableCell>
        <TableCell parentColumn="Type" data-qa-domain-type>
          {type}
        </TableCell>
        <TableCell>
          <ActionMenu
            domain={domain}
            id={id}
            type={type}
            onRemove={onRemove}
            onClone={onClone}
            onEdit={onEdit}
          />
        </TableCell>
      </TableRow>
    );
  }
}

const styled = withStyles(styles);

export default styled(DomainTableRow);
