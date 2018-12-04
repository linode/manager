import { pathOr } from 'ramda';
import * as React from 'react';
import { Link } from 'react-router-dom';
import { compose } from 'recompose';

import { StyleRulesCallback, withStyles, WithStyles } from 'src/components/core/styles';
import TableCell from 'src/components/core/TableCell';
import Typography from 'src/components/core/Typography';
import DateTimeDisplay from 'src/components/DateTimeDisplay';
import { Item } from 'src/components/EnhancedSelect/Select';
import Grid from 'src/components/Grid';
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
| 'tableCell'
| 'tag'
| 'link'
| 'labelCell'
| 'iconCell'
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
    width: '30%'
  },
  iconCell: {
    width: '10%'
  },
  regionCell: {
    width: '15%'
  },
  createdCell: {
    width: '15%'
  },
  tagCell: {
    width: '30%'
  },
  icon: {
    position: 'relative',
    top: 1,
    width: 40,
    height: 40,
    marginLeft: 5,
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
  },
  resultBody: {
  },
  status: {
    marginLeft: theme.spacing.unit / 2,
  },
  tableCell: {
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
      <TableCell className={classes.iconCell}>
        <Grid item className={classes.tableCell}>
          <Icon className={classes.icon} />
        </Grid>
      </TableCell>
      <TableCell className={classes.labelCell}>
        <Grid container className={classes.label} xs={6}>
          <Link to={result.data.path} className={classes.link} title={result.label}>
            <div className={classes.labelRow}>
              <Typography variant="subheading">{result.label}</Typography>
              <div className={classes.status} >
                {result.data.status && <LinodeStatusIndicator status={result.data.status} />}
              </div>
            </div>
            <Typography variant="body1">{result.data.description}</Typography>
          </Link>
        </Grid>
      </TableCell>
      <TableCell className={classes.regionCell}>
        {result.data.region &&
            <RegionIndicator region={result.data.region} />
        }
      </TableCell>
      <TableCell className={classes.createdCell}>
        {result.data.created &&
          <DateTimeDisplay value={result.data.created} />
        }
      </TableCell>
      <TableCell className={classes.tagCell}>
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
