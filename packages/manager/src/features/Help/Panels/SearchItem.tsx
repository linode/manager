import { Typography } from '@linode/ui';
import * as React from 'react';
import { useStyles } from 'tss-react/mui';

import Arrow from 'src/assets/icons/diagonalArrow.svg';
import { Option } from 'src/components/EnhancedSelect/components/Option';
import { sanitizeHTML } from 'src/utilities/sanitizeHTML';

import type { OptionProps } from 'react-select';

interface Props extends OptionProps<any, any> {
  data: {
    data: any;
    label: string;
  };
  searchText: string;
}

export const SearchItem = (props: Props) => {
  const getLabel = () => {
    if (isFinal) {
      return props.label ? `Search for "${props.label}"` : 'Search';
    } else {
      return props.label;
    }
  };

  const { cx } = useStyles();

  const {
    data,
    isFocused,
    selectProps: { classes },
  } = props;
  const source = data.data ? data.data.source : '';
  const isFinal = source === 'finalLink';

  return (
    <Option
      className={cx({
        [classes.algoliaRoot]: true,
        [classes.selectedMenuItem]: isFocused,
      })}
      aria-label={!isFinal ? `${getLabel()} - opens in a new tab` : undefined}
      attrs={{ ['data-qa-search-result']: source }}
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
    </Option>
  );
};
