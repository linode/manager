import { Theme } from '@mui/material/styles';
import { makeStyles } from '@mui/styles';
import * as React from 'react';
import { Link } from 'react-router-dom';

import { DateTimeDisplay } from 'src/components/DateTimeDisplay';
import { Item } from 'src/components/EnhancedSelect/Select';
import { Hidden } from 'src/components/Hidden';
import { TableCell } from 'src/components/TableCell';
import { TableRow } from 'src/components/TableRow';
import { Tags } from 'src/components/Tags/Tags';
import { Typography } from 'src/components/Typography';
import { RegionIndicator } from 'src/features/Linodes/LinodesLanding/RegionIndicator';

const useStyles = makeStyles((theme: Theme) => ({
  createdCell: {
    [theme.breakpoints.up('md')]: {
      width: '20%',
    },
    width: '100%',
  },
  labelCell: {
    [theme.breakpoints.up('md')]: {
      width: '35%',
    },
    width: '60%',
  },
  link: {
    color: theme.textColors.linkActiveLight,
    display: 'block',
    fontFamily: theme.font.bold,
    fontSize: '.875rem',
    lineHeight: '1.125rem',
  },
  regionCell: {
    [theme.breakpoints.up('md')]: {
      width: '15%',
    },
    width: '100%',
  },
  root: {
    cursor: 'pointer',
    paddingBottom: '0 !important',
    paddingTop: '0 !important',
    transition: theme.transitions.create(['background-color']),
    width: '100%',
  },
  tag: {
    margin: theme.spacing(0.5),
  },
  tagCell: {
    [theme.breakpoints.up('md')]: {
      width: '30%',
    },
    width: '100%',
  },
}));

interface Props {
  result: Item;
}

type CombinedProps = Props;

export const ResultRow: React.FC<CombinedProps> = (props) => {
  const classes = useStyles();

  const { result } = props;

  return (
    <TableRow
      ariaLabel={result.label}
      className={classes.root}
      data-qa-result-row={result.label}
    >
      <TableCell className={classes.labelCell}>
        <Link
          className={classes.link}
          title={result.label}
          to={result.data.path}
        >
          {result.label}
        </Link>
        <Typography variant="body1">{result.data.description}</Typography>
      </TableCell>
      <TableCell className={classes.regionCell}>
        {result.data.region && <RegionIndicator region={result.data.region} />}
      </TableCell>
      <Hidden mdDown>
        <TableCell className={classes.createdCell}>
          {result.data.created && (
            <Typography>
              <DateTimeDisplay value={result.data.created} />
            </Typography>
          )}
        </TableCell>

        <TableCell className={classes.tagCell}>
          <Tags data-testid={'result-tags'} tags={result.data.tags} />
        </TableCell>
      </Hidden>
    </TableRow>
  );
};

export default ResultRow;
