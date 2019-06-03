import { pathOr } from 'ramda';
import * as React from 'react';
import { Link } from 'react-router-dom';
import { compose } from 'recompose';

import Hidden from 'src/components/core/Hidden';
import {
  StyleRulesCallback,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import DateTimeDisplay from 'src/components/DateTimeDisplay';
import { Item } from 'src/components/EnhancedSelect/Select';
import EntityIcon from 'src/components/EntityIcon';
import Grid from 'src/components/Grid';
import TableCell from 'src/components/TableCell';
import TableRow from 'src/components/TableRow';
import Tags from 'src/components/Tags';
import RegionIndicator from 'src/features/linodes/LinodesLanding/RegionIndicator';
import { linodeInTransition } from 'src/features/linodes/transitions';

type ClassNames =
  | 'root'
  | 'label'
  | 'icon'
  | 'labelRow'
  | 'resultBody'
  | 'iconGridCell'
  | 'tag'
  | 'link'
  | 'labelCell'
  | 'iconTableCell'
  | 'regionCell'
  | 'createdCell'
  | 'tagCell';

const styles: StyleRulesCallback<ClassNames> = theme => ({
  transition: theme.transitions.create(['background-color']),
  root: {
    paddingTop: '0 !important',
    paddingBottom: '0 !important',
    width: '100%',
    cursor: 'pointer'
  },
  description: {},
  label: {
    wordBreak: 'break-all'
  },
  labelCell: {
    width: '100%',
    // Overriding mobile version of TableCell's styles for the label cell only
    [theme.breakpoints.between('xs', 'sm')]: {
      '& > span:first-child': {
        display: 'none'
      },
      '& > span:last-child': {
        textAlign: 'left',
        wordBreak: 'normal',
        marginLeft: 0
      }
    },
    [theme.breakpoints.up('md')]: {
      width: '35%',
      padding: 4
    }
  },
  iconTableCell: {
    [theme.breakpoints.up('md')]: {
      width: '4%',
      padding: 4
    }
  },
  regionCell: {
    width: '100%',
    [theme.breakpoints.up('md')]: {
      width: '15%',
      padding: 4
    }
  },
  createdCell: {
    width: '100%',
    [theme.breakpoints.up('md')]: {
      width: '20%',
      padding: 4
    }
  },
  tagCell: {
    width: '100%',
    [theme.breakpoints.up('md')]: {
      width: '30%',
      padding: 4
    }
  },
  icon: {
    position: 'relative',
    top: 1,
    width: 40,
    height: 40,
    '& .circle': {
      fill: theme.bg.offWhiteDT
    },
    '& .outerCircle': {
      stroke: theme.bg.main
    }
  },
  labelRow: {
    display: 'flex',
    flexFlow: 'row nowrap',
    alignItems: 'center'
  },
  resultBody: {},
  iconGridCell: {
    display: 'flex',
    alignItems: 'center',
    padding: 4
  },
  tag: {
    margin: theme.spacing(1) / 2
  },
  link: {
    display: 'block'
  }
});

interface Props {
  result: Item;
}

type CombinedProps = Props & WithStyles<ClassNames>;

export const ResultRow: React.StatelessComponent<CombinedProps> = props => {
  const { classes, result } = props;
  const icon = pathOr<string>('default', ['data', 'icon'], result);
  const status = result.data.status;
  return (
    <TableRow
      className={classes.root}
      rowLink={result.data.path}
      data-qa-result-row={result.label}
    >
      <Hidden smDown>
        <TableCell className={classes.iconTableCell}>
          <Grid item className={classes.iconGridCell}>
            <EntityIcon
              variant={icon}
              status={status && status}
              marginTop={3}
              loading={status && linodeInTransition(status)}
            />
          </Grid>
        </TableCell>
      </Hidden>
      <TableCell className={classes.labelCell} parentColumn="Label">
        <div className={classes.labelRow}>
          <Link
            to={result.data.path}
            className={classes.link}
            title={result.label}
          >
            <div className={classes.labelRow}>
              <Typography variant="h3" className={classes.label}>
                {result.label}
              </Typography>
            </div>
            <Typography variant="body1">{result.data.description}</Typography>
          </Link>
        </div>
      </TableCell>
      <TableCell className={classes.regionCell} parentColumn="Region">
        {result.data.region && <RegionIndicator region={result.data.region} />}
      </TableCell>
      <TableCell className={classes.createdCell} parentColumn="Created">
        {result.data.created && (
          <React.Fragment>
            <Typography>
              <DateTimeDisplay value={result.data.created} />
            </Typography>
          </React.Fragment>
        )}
      </TableCell>
      <TableCell className={classes.tagCell} parentColumn="Tags">
        <Tags tags={result.data.tags} />
      </TableCell>
    </TableRow>
  );
};

const styled = withStyles(styles);

const enhanced = compose<CombinedProps, Props>(styled)(ResultRow);

export default enhanced;
