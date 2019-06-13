<<<<<<< HEAD
import * as classNames from 'classnames';
=======
>>>>>>> fix WithStyles imports & cleanup
import * as React from 'react';
import { OptionProps } from 'react-select/lib/components/Option';
import Arrow from 'src/assets/icons/diagonalArrow.svg';
<<<<<<< HEAD
=======
import ListItem from 'src/components/core/ListItem';
import {
  createStyles,
  Theme,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
>>>>>>> fix WithStyles imports & cleanup
import Typography from 'src/components/core/Typography';

interface Props extends OptionProps<any> {
  data: {
    label: string;
    data: any;
  };
  searchText: string;
}

const SearchItem: React.StatelessComponent<Props> = props => {
  const getLabel = () => {
    if (isFinal) {
      return props.label ? `Search for "${props.label}"` : 'Search';
    } else {
      return props.label;
    }
  };

  const {
    data,
    innerProps,
    isFocused,
    selectProps: { classes }
  } = props;
  const source = data.data ? data.data.source : '';
  const isFinal = source === 'finalLink';

  return (
    <div
      className={classNames({
        [classes.algoliaRoot]: true,
        [classes.selectedMenuItem]: isFocused
      })}
      data-qa-search-result={source}
      {...innerProps}
    >
      {isFinal ? (
        <div className={classes.finalLink}>
          <Typography>{getLabel()}</Typography>
        </div>
      ) : (
        <>
          <div className={classes.row}>
            <div
              className={classes.label}
              dangerouslySetInnerHTML={{ __html: getLabel() }}
            />
            <Arrow className={classes.icon} />
          </div>
          <Typography className={classes.source}>{source}</Typography>
        </>
      )}
    </div>
  );
};

export default SearchItem;
