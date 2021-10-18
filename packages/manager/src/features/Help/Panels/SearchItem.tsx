import classNames from 'classnames';
import * as React from 'react';
import { OptionProps } from 'react-select';
import Arrow from 'src/assets/icons/diagonalArrow.svg';
import Typography from 'src/components/core/Typography';
import Option from 'src/components/EnhancedSelect/components/Option';
import { sanitizeHTML } from 'src/utilities/sanitize-html';

interface Props extends OptionProps<any, any> {
  data: {
    label: string;
    data: any;
  };
  searchText: string;
}

const SearchItem: React.FC<Props> = (props) => {
  const getLabel = () => {
    if (isFinal) {
      return props.label ? `Search for "${props.label}"` : 'Search';
    } else {
      return props.label;
    }
  };

  const {
    data,
    isFocused,
    selectProps: { classes },
  } = props;
  const source = data.data ? data.data.source : '';
  const isFinal = source === 'finalLink';

  return (
    <Option
      className={classNames({
        [classes.algoliaRoot]: true,
        [classes.selectedMenuItem]: isFocused,
      })}
      value={data.label}
      aria-describedby={!isFinal ? 'external-site' : undefined}
      attrs={{ ['data-qa-search-result']: source }}
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
              className={classes.label}
              dangerouslySetInnerHTML={{ __html: sanitizeHTML(getLabel()) }}
            />
            <Arrow className={classes.icon} />
          </div>
          <Typography className={classes.source}>{source}</Typography>
        </>
      )}
    </Option>
  );
};

export default SearchItem;
