import { ListItem, Typography } from '@linode/ui';
import * as React from 'react';
import { useStyles } from 'tss-react/mui';

import Arrow from 'src/assets/icons/diagonalArrow.svg';
import { sanitizeHTML } from 'src/utilities/sanitizeHTML';

interface Props {
  data: {
    data: {
      source: string;
    };
    label: string;
  };
  isFocused?: boolean;
  searchText: string;
  selectProps?: any;
}

export const SearchItem = (props: Props) => {
  const getLabel = () => {
    if (isFinal) {
      return props.data.label ? `Search for "${props.data.label}"` : 'Search';
    } else {
      return props.data.label;
    }
  };

  const { cx } = useStyles();

  const { data, isFocused, selectProps } = props;
  const source = data.data ? data.data.source : '';
  const isFinal = source === 'finalLink';

  const classes = selectProps?.classes || {};

  return (
    <ListItem
      className={cx({
        [classes.algoliaRoot]: true,
        [classes.selectedMenuItem]: isFocused,
      })}
      aria-label={!isFinal ? `${getLabel()} - opens in a new tab` : undefined}
      value={data.label}
      {...props}
    >
      {isFinal ? (
        <div className={classes.finalLink}>
          <Typography>{getLabel()}</Typography>
        </div>
      ) : (
        <>
          <div className={classes.row}>
            <div
              dangerouslySetInnerHTML={{
                __html: sanitizeHTML({
                  sanitizingTier: 'flexible',
                  text: getLabel(),
                }),
              }}
              className={classes.label}
            />
            <Arrow className={classes.icon} />
          </div>
          <Typography className={classes.source}>{source}</Typography>
        </>
      )}
    </ListItem>
  );
};
