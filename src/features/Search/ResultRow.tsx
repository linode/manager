import { pathOr } from 'ramda';
import * as React from 'react';
import { Link } from 'react-router-dom';
import { compose } from 'recompose';

import Hidden from 'src/components/core/Hidden';
import { StyleRulesCallback, withStyles, WithStyles } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import DateTimeDisplay from 'src/components/DateTimeDisplay';
import { Item } from 'src/components/EnhancedSelect/Select';
import Grid from 'src/components/Grid';
import TableCell from 'src/components/TableCell';
import TableRow from 'src/components/TableRow';
import Tags from 'src/components/Tags';
import LinodeStatusIndicator from 'src/features/linodes/LinodesLanding/LinodeStatusIndicator';
import RegionIndicator from 'src/features/linodes/LinodesLanding/RegionIndicator';

import { iconMap } from './utils';

type ClassNames = 'root'
| 'label'
| 'icon'
| 'labelRow'
| 'resultBody'
| 'status'
| 'iconGridCell'
| 'tag'
| 'link'
| 'labelCell'
| 'iconTableCell'
| 'regionCell'
| 'createdCell'
| 'tagCell';

const styles: StyleRulesCallback<ClassNames> = (theme) => ({
  transition: theme.transitions.create(['background-color']),
  root: {
    paddingTop: '0 !important',
    paddingBottom: '0 !important',
    width: '100%',
    cursor: 'pointer',
    '&:hover': {
      '& $rowContent': {
        background: theme.bg.tableHeader,
        '&:before': {
          backgroundColor: theme.palette.primary.main,
        }
      }
    },
  },
  label: {
    wordBreak: 'break-all',
  },
  labelCell: {
    width: '100%', 
    [theme.breakpoints.up('md')]: {
      width: '35%',
    },
  },
  iconTableCell: {
    [theme.breakpoints.up('md')]: {
      width: '5%',
    },
  },
  regionCell: {
    width: '100%', 
    [theme.breakpoints.up('md')]: {
      width: '15%',
    },
  },
  createdCell: {
    width: '100%', 
    [theme.breakpoints.up('md')]: {
      width: '20%',
    },
  },
  tagCell: {
    width: '100%',
    [theme.breakpoints.up('md')]: {
      width: '30%',
    },
  },
  icon: {
    position: 'relative',
    top: 1,
    width: 40,
    height: 40,
    '& .circle': {
      fill: theme.bg.offWhiteDT,
    },
    '& .outerCircle': {
      stroke: theme.bg.main,
    },
  },
  labelRow: {
    display: 'flex',
    flexFlow: 'row nowrap',
    alignItems: 'center',
    justifyContent: 'flex-end',
    [theme.breakpoints.up('md')]: {
      justifyContent: 'flex-start',
    },
  },
  resultBody: {
  },
  status: {
    marginLeft: theme.spacing.unit / 2,
    position: 'relative',
    top: 0,
    lineHeight: '0.8rem',
  },
  iconGridCell: {
    display: 'flex',
    alignItems: 'center',
    padding: '4px 8px !important',
  },
  tag: {
    margin: theme.spacing.unit / 2,
  },
  link: {
    display: 'block',
  }
});

interface Props {
  result: Item;
}

type CombinedProps = Props & WithStyles<ClassNames>;

export const ResultRow: React.StatelessComponent<CombinedProps> = (props) => {
  const { classes, result } = props;
  const icon = pathOr<string>('default', ['data','icon'], result);
  const Icon = iconMap[icon];
  return (
    <TableRow
      className={classes.root}
      rowLink={result.data.path}
    >
      <Hidden smDown>
        <TableCell className={classes.iconTableCell}>
          <Grid item className={classes.iconGridCell}>
            <Icon className={classes.icon} />
          </Grid>
          </TableCell>
      </Hidden>
      <TableCell className={classes.labelCell} parentColumn="Label">
        <div className={classes.labelRow}>
          <Link to={result.data.path} className={classes.link} title={result.label}>
            <div className={classes.labelRow}>
              <Typography variant="subheading" className={classes.label}>{result.label}</Typography>
              <div className={classes.status} >
                {result.data.status && <LinodeStatusIndicator status={result.data.status} />}
              </div>
            </div>
            <Typography variant="body1">{result.data.description}</Typography>
          </Link>
        </div>
      </TableCell>
      <TableCell className={classes.regionCell} parentColumn="Region">
        {result.data.region &&
          <RegionIndicator region={result.data.region} />
        }
      </TableCell>
      <TableCell className={classes.createdCell} parentColumn="Created">
        {result.data.created &&
          <React.Fragment>
            <Typography >
              Created <DateTimeDisplay value={result.data.created} />
            </Typography>
          </React.Fragment>
        }
      </TableCell>
      <TableCell className={classes.tagCell} parentColumn="Tags">
        <Tags tags={result.data.tags} />
      </TableCell>
    </TableRow>
  );
};

const styled = withStyles(styles);

const enhanced = compose<CombinedProps, Props>(
  styled,
)(ResultRow);

export default enhanced;
