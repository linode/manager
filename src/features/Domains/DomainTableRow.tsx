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
  onClone: (domain: string, id: number) => void;
  onEdit: (domain: string, id: number) => void;
}

type CombinedProps = Props & WithStyles<ClassNames>;

const handleRowClick = (
  e:
    | React.ChangeEvent<HTMLTableRowElement>
    | React.MouseEvent<HTMLAnchorElement, MouseEvent>,
  props: CombinedProps
) => {
  const { domain, id, type, onEdit } = props;

  if (type === 'slave') {
    e.preventDefault();
    onEdit(domain, id);
  }
};

const DomainTableRow: React.StatelessComponent<CombinedProps> = props => {
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
  } = props;

  return (
    <TableRow
      key={id}
      data-qa-domain-cell={domain}
      className={`${classes.domainRow} ${'fade-in-table'}`}
      rowLink={
        type === 'slave' ? e => handleRowClick(e, props) : `/domains/${id}`
      }
    >
      <TableCell parentColumn="Domain" data-qa-domain-label>
        <Link to={`/domains/${id}`} onClick={e => handleRowClick(e, props)}>
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
                <Typography variant="h3" data-qa-label>
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
          type={type}
          onRemove={onRemove}
          onClone={onClone}
          onEdit={onEdit}
        />
      </TableCell>
    </TableRow>
  );
};

const styled = withStyles(styles);

export default styled(DomainTableRow);
