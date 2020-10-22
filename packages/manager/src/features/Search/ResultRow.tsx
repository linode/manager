import { pathOr } from 'ramda';
import * as React from 'react';
import * as classNames from 'classnames';
import { Link } from 'react-router-dom';
import { compose } from 'recompose';
import Hidden from 'src/components/core/Hidden';
import {
  createStyles,
  Theme,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import DateTimeDisplay from 'src/components/DateTimeDisplay';
import { Item } from 'src/components/EnhancedSelect/Select';
import EntityIcon from 'src/components/EntityIcon';
import Grid from 'src/components/Grid';
import TableCell_PreCMR from 'src/components/TableCell';
import TableCell_CMR from 'src/components/TableCell/TableCell_CMR';
import TableRow_PreCMR from 'src/components/TableRow';
import TableRow_CMR from 'src/components/TableRow/TableRow_CMR';
import Tags from 'src/components/Tags';
import RegionIndicator from 'src/features/linodes/LinodesLanding/RegionIndicator';
import { linodeInTransition } from 'src/features/linodes/transitions';
import useFlags from 'src/hooks/useFlags';

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
  | 'tagCell'
  | 'linkCMR'
  | 'preCMRCell'
  | 'labelCellCMR';

const styles = (theme: Theme) =>
  createStyles({
    root: {
      paddingTop: '0 !important',
      paddingBottom: '0 !important',
      width: '100%',
      cursor: 'pointer',
      transition: theme.transitions.create(['background-color'])
    },
    description: {},
    label: {
      wordBreak: 'break-all'
    },
    labelCell: {
      width: '100%',
      [theme.breakpoints.up('md')]: {
        width: '35%'
      }
    },
    labelCellCMR: {
      width: '60%',
      [theme.breakpoints.up('md')]: {
        width: '35%'
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

      }
    },
    createdCell: {
      width: '100%',
      [theme.breakpoints.up('md')]: {
        width: '20%',

      }
    },
    tagCell: {
      width: '100%',
      [theme.breakpoints.up('md')]: {
        width: '30%',

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
    },
    linkCMR: {
      display: 'block',
      fontFamily: theme.font.bold,
      fontSize: '.875rem',
      lineHeight: '1.125rem',
      textDecoration: 'underline',
      color: theme.cmrTextColors.linkActiveLight
    },
    preCMRCell: {
      padding: 4
    }
  });

interface Props {
  result: Item;
}

type CombinedProps = Props & WithStyles<ClassNames>;

export const ResultRow: React.FC<CombinedProps> = props => {
  const { classes, result } = props;
  const flags = useFlags();
  const icon = pathOr<string>('default', ['data', 'icon'], result);
  const status = result.data.status;

  const TableRow = flags.cmr ? TableRow_CMR : TableRow_PreCMR;
  const TableCell = flags.cmr ? TableCell_CMR : TableCell_PreCMR;

  return (
    <TableRow
      className={classes.root}
      rowLink={result.data.path}
      data-qa-result-row={result.label}
      ariaLabel={result.label}
    >
      {!flags.cmr && <Hidden smDown>
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
        </Hidden>}
      <TableCell className={classNames({
        [classes.labelCell]: true,
        [classes.labelCellCMR]: flags.cmr,
        [classes.preCMRCell]: !flags.cmr
        })}
        parentColumn="Label"
      >
        <div className={classes.labelRow}>
          <Link
            to={result.data.path}
            className={classNames({
              [classes.link]: !flags.cmr,
              [classes.linkCMR]: flags.cmr
            })}
            title={result.label}
          >
           {result.label}
          </Link>
          <Typography variant="body1">{result.data.description}</Typography>
        </div>
      </TableCell>
      <TableCell className={classNames({
        [classes.regionCell]: true,
        [classes.preCMRCell]: !flags.cmr
        })}
        parentColumn="Region"
      >
        {result.data.region && <RegionIndicator region={result.data.region} />}
      </TableCell>
      <Hidden smDown>
        <TableCell className={classNames({
          [classes.createdCell]: true,
          [classes.preCMRCell]: !flags.cmr
          })}
          parentColumn="Created"
        >
          {result.data.created && (
            <React.Fragment>
              <Typography>
                <DateTimeDisplay value={result.data.created} />
              </Typography>
            </React.Fragment>
          )}
        </TableCell>

        <TableCell className={classNames({
        [classes.tagCell]: true,
        [classes.preCMRCell]: !flags.cmr
        })}
        parentColumn="Tags"
      >
          <Tags tags={result.data.tags} data-testid={'result-tags'} />
        </TableCell>
      </Hidden>
    </TableRow>
  );
};

const styled = withStyles(styles);

const enhanced = compose<CombinedProps, Props>(styled)(ResultRow);

export default enhanced;
