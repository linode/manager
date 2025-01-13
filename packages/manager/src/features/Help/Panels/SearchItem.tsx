import { ListItem, Typography } from '@linode/ui';
import * as React from 'react';
import { makeStyles } from 'tss-react/mui';

import Arrow from 'src/assets/icons/diagonalArrow.svg';
import { sanitizeHTML } from 'src/utilities/sanitizeHTML';

import type { Theme } from '@mui/material/styles';

const useStyles = makeStyles()((theme: Theme) => ({
  arrow: {
    color: theme.palette.primary.main,
    height: 12,
    width: 12,
  },
  root: {
    display: 'flex',
    justifyContent: 'space-between',
    width: '100%',
  },
  source: {
    color: theme.color.headline,
  },
}));

interface Props {
  data: {
    data: {
      source: string;
    };
    label: string;
  };
  isFocused?: boolean;
  searchText: string;
}

export const SearchItem = (props: Props) => {
  const getLabel = () => {
    if (isFinal) {
      return props.data.label ? `Search for "${props.data.label}"` : 'Search';
    } else {
      return props.data.label;
    }
  };

  const { classes } = useStyles();

  const { data } = props;
  const source = data.data ? data.data.source : '';
  const isFinal = source === 'finalLink';

  return (
    <ListItem
      aria-label={!isFinal ? `${getLabel()} - opens in a new tab` : undefined}
      value={data.label}
      {...props}
    >
      {isFinal ? (
        <div className={classes.root}>
          <Typography className={classes.source}>{getLabel()}</Typography>
        </div>
      ) : (
        <div className={classes.root}>
          <div>
            <div
              dangerouslySetInnerHTML={{
                __html: sanitizeHTML({
                  sanitizingTier: 'flexible',
                  text: getLabel(),
                }),
              }}
            />
            <Typography className={classes.source}>{source}</Typography>
          </div>
          <Arrow className={classes.arrow} />
        </div>
      )}
    </ListItem>
  );
};
