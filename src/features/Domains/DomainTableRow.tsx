import * as React from 'react';
import { Link } from 'react-router-dom';
import DomainIcon from 'src/assets/addnewmenu/domain.svg';
import { StyleRulesCallback, WithStyles, withStyles } from 'src/components/core/styles';
import Grid from 'src/components/Grid';
import TableCell from 'src/components/TableCell';
import TableRow from 'src/components/TableRow';
import Tags from 'src/components/Tags';
import ActionMenu from './DomainActionMenu';

type ClassNames =
  | 'domain'
  | 'icon'
  | 'tagWrapper'
  | 'domainRow';

const styles: StyleRulesCallback<ClassNames> = (theme) => ({
  domain: {
    width: '60%',
  },
  domainRow: {
    height: 75,
    backgroundColor: theme.bg.white,
  },
  icon: {
    position: 'relative',
    top: 3,
    width: 40,
    height: 40,
    '& .circle': {
      fill: theme.bg.offWhiteDT,
    },
    '& .outerCircle': {
      stroke: theme.bg.main,
    },
  },
  tagWrapper: {
    marginTop: theme.spacing.unit / 2,
    '& [class*="MuiChip"]': {
      cursor: 'pointer',
    },
  },
});


interface Props {
  domain: string;
  id: number;
  tags: string[];
  type: 'master' | 'slave';
  onRemove: (domain: string, domainID: number) => void;
  onClone: (domain: string, cloneId: number) => void;
}

type CombinedProps = Props & WithStyles<ClassNames>;

const DomainsTableRow: React.StatelessComponent<CombinedProps> = (props) => {
  const { classes, domain, id, tags, type, onClone, onRemove } = props;

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
              <DomainIcon className={classes.icon}/>
            </Grid>
            <Grid item>
              {domain}
              <div className={classes.tagWrapper}>
                <Tags tags={tags} />
              </div>
            </Grid>
          </Grid>
        </Link>
      </TableCell>
      <TableCell parentColumn="Type" data-qa-domain-type>{type}</TableCell>
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

export default styled(DomainsTableRow);
