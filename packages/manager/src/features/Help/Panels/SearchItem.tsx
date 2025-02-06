import { ListItem, Typography } from '@linode/ui';
import * as React from 'react';
import { makeStyles } from 'tss-react/mui';

import ExternalLink from 'src/assets/icons/external-link.svg';
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
}));

interface Props {
  data: {
    data: {
      source: string;
    };
    label: string;
  };
}

export const SearchItem = (props: Props) => {
  const { data } = props;
  const getLabel = () => {
    if (isFinal) {
      return data.label ? `Search for "${data.label}"` : 'Search';
    } else {
      return data.label;
    }
  };

  const { classes } = useStyles();

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
          <Typography
            sx={(theme) => ({
              color: theme.color.headline,
            })}
          >
            {getLabel()}
          </Typography>
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
            <Typography
              sx={(theme) => ({
                color: theme.color.headline,
              })}
            >
              {source}
            </Typography>
          </div>
          <ExternalLink className={classes.arrow} />
        </div>
      )}
    </ListItem>
  );
};
