import * as React from 'react';
import { Link } from 'react-router-dom';
import { StyleRulesCallback, withStyles, WithStyles } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import Grid from 'src/components/Grid';
import TableCell from 'src/components/TableCell';
import Tags from 'src/components/Tags';
import LinodeStatusIndicator from '../LinodeStatusIndicator';

type ClassNames = 'root' | 'link' | 'tagWrapper';

const styles: StyleRulesCallback<ClassNames> = (theme) => ({
  link: {
    display: 'block',
  },
  root: {
    width: '30%',
    '& h3': {
      transition: theme.transitions.create(['color']),
    },
    [theme.breakpoints.down('sm')]: {
      width: '100%'
    },
  },
  tagWrapper: {
    marginTop: theme.spacing.unit / 2,
    marginLeft: theme.spacing.unit * 4,
    '& [class*="MuiChip"]': {
      cursor: 'pointer',
    },
  },
});

interface Props {
  linodeId: number;
  linodeLabel: string;
  linodeStatus: Linode.LinodeStatus;
  linodeTags: string[];
}

type CombinedProps = Props & WithStyles<ClassNames>;

const LinodeRowHeadCell: React.StatelessComponent<CombinedProps> = (props) => {
  const {
    classes,
    linodeId,
    linodeLabel,
    linodeStatus,
    linodeTags,
  } = props;

  return (
    <TableCell parentColumn="Linode" className={classes.root}>
      <Link to={`/linodes/${linodeId}`} className={classes.link}>
        <Grid container wrap="nowrap" alignItems="center">
          <Grid item className="py0">
            <LinodeStatusIndicator status={linodeStatus} />
          </Grid>
          <Grid item className="py0">
            <Typography role="header" variant="subheading" data-qa-label>
              {linodeLabel}
            </Typography>
          </Grid>
        </Grid>
        <div className={classes.tagWrapper}>
          <Tags tags={linodeTags} />
        </div>
      </Link>
    </TableCell>
  );
};

const styled = withStyles(styles);

export default styled(LinodeRowHeadCell);
