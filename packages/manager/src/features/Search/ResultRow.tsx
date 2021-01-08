import * as React from 'react';
import { Link } from 'react-router-dom';
import Hidden from 'src/components/core/Hidden';
import { makeStyles, Theme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import DateTimeDisplay from 'src/components/DateTimeDisplay';
import { Item } from 'src/components/EnhancedSelect/Select';
import TableCell from 'src/components/TableCell/TableCell_CMR';
import TableRow from 'src/components/TableRow/TableRow_CMR';
import Tags from 'src/components/Tags';
import RegionIndicator from 'src/features/linodes/LinodesLanding/RegionIndicator';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    cursor: 'pointer',
    paddingTop: '0 !important',
    paddingBottom: '0 !important',
    width: '100%',
    transition: theme.transitions.create(['background-color'])
  },
  labelCell: {
    width: '60%',
    [theme.breakpoints.up('md')]: {
      width: '35%'
    }
  },
  regionCell: {
    width: '100%',
    [theme.breakpoints.up('md')]: {
      width: '15%'
    }
  },
  createdCell: {
    width: '100%',
    [theme.breakpoints.up('md')]: {
      width: '20%'
    }
  },
  tagCell: {
    width: '100%',
    [theme.breakpoints.up('md')]: {
      width: '30%'
    }
  },
  tag: {
    margin: theme.spacing() / 2
  },
  link: {
    display: 'block',
    color: theme.cmrTextColors.linkActiveLight,
    fontFamily: theme.font.bold,
    fontSize: '.875rem',
    lineHeight: '1.125rem'
  }
}));

interface Props {
  result: Item;
}

type CombinedProps = Props;

export const ResultRow: React.FC<CombinedProps> = props => {
  const classes = useStyles();

  const { result } = props;

  return (
    <TableRow
      className={classes.root}
      rowLink={result.data.path}
      data-qa-result-row={result.label}
      ariaLabel={result.label}
    >
      <TableCell className={classes.labelCell} parentColumn="Label">
        <Link
          to={result.data.path}
          className={classes.link}
          title={result.label}
        >
          {result.label}
        </Link>
        <Typography variant="body1">{result.data.description}</Typography>
      </TableCell>
      <TableCell className={classes.regionCell} parentColumn="Region">
        {result.data.region && <RegionIndicator region={result.data.region} />}
      </TableCell>
      <Hidden smDown>
        <TableCell className={classes.createdCell} parentColumn="Created">
          {result.data.created && (
            <Typography>
              <DateTimeDisplay value={result.data.created} />
            </Typography>
          )}
        </TableCell>

        <TableCell className={classes.tagCell} parentColumn="Tags">
          <Tags tags={result.data.tags} data-testid={'result-tags'} />
        </TableCell>
      </Hidden>
    </TableRow>
  );
};

export default ResultRow;
