import * as React from 'react';
import { Link } from 'react-router-dom';
import {
  StyleRulesCallback,
  WithStyles,
  withStyles
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

const styles: StyleRulesCallback<ClassNames> = theme => ({
  domain: {
    width: '60%'
  },
  domainRow: {
    backgroundColor: theme.bg.white
  },
  domainCellContainer: {
    padding: `${theme.spacing.unit}px !important`
  },
  labelStatusWrapper: {
    display: 'flex',
    flexFlow: 'row nowrap',
    alignItems: 'center'
  },
  tagWrapper: {
    marginTop: theme.spacing.unit / 2,
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
  onRemove: (domain: string, domainID: number) => void;
  onClone: (domain: string, cloneId: number) => void;
}

type CombinedProps = Props & WithStyles<ClassNames>;

const DomainTableRow: React.StatelessComponent<CombinedProps> = props => {
  const { classes, domain, id, tags, type, status, onClone, onRemove } = props;

  return (
    <TableRow
      key={id}
      data-qa-domain-cell={domain}
      className={`${classes.domainRow} ${'fade-in-table'}`}
      rowLink={`/domains/${id}`}
    >
      <TableCell parentColumn="Domain" data-qa-domain-label>
        <Link to={`/domains/${id}`}>
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
                <Typography role="header" variant="h3" data-qa-label>
                  {domain}
                </Typography>
              </div>
              <div className={classes.tagWrapper}>
                <Tags tags={tags} />
              </div>
            </Grid>
          </Grid>
        </Link>
      </TableCell>
      <TableCell parentColumn="Type" data-qa-domain-type>
        {type}
      </TableCell>
      <TableCell>
        <ActionMenu
          domain={domain}
          id={id}
          onRemove={onRemove}
          onClone={onClone}
        />
      </TableCell>
    </TableRow>
  );
};

const styled = withStyles(styles);

export default styled(DomainTableRow);
