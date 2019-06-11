import * as React from 'react';
import { OptionProps } from 'react-select/lib/components/Option';
import Arrow from 'src/assets/icons/diagonalArrow.svg';
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
    selectProps: { classes }
  } = props;
  const source = data.data ? data.data.source : '';
  const isFinal = source === 'finalLink';

  console.log(data);

  return (
    <div
      className={classes.algoliaRoot}
      data-qa-search-result={source}
      {...innerProps}
    >
      <div className={classes.row}>
        <div
          className={classes.label}
          dangerouslySetInnerHTML={{ __html: getLabel() }}
        />
        {!isFinal && <Arrow className={classes.icon} />}
      </div>
      {!isFinal && <Typography className={classes.source}>{source}</Typography>}
    </div>
  );
};

export default SearchItem;
