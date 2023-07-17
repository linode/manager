import { LinodeStatus } from '@linode/api-v4/lib/linodes';
import { pathOr } from 'ramda';
import * as React from 'react';
import { OptionProps } from 'react-select';

import { EntityIcon } from 'src/components/EntityIcon/EntityIcon';
import { Tag } from 'src/components/Tag/Tag';
import { linodeInTransition } from 'src/features/Linodes/transitions';

export interface SearchSuggestionT {
  description: string;
  history: any;
  icon: string;
  isHighlighted?: boolean;
  path: string;
  searchText: string;
  status?: LinodeStatus;
  tags?: string[];
}

interface Props extends OptionProps<any, any> {
  data: {
    data: SearchSuggestionT;
    label: string;
  };
  searchText: string;
}

type CombinedProps = Props;

class SearchSuggestion extends React.Component<CombinedProps> {
  render() {
    const suggestion = this.props.data.data;
    const { classes } = this.props.selectProps;
    const { icon } = pathOr<string>('default', [], suggestion);
    const { searchText } = suggestion;
    const { innerProps, innerRef } = this.props;
    const { status } = suggestion;
    return (
      <div
        className={`
          ${classes.suggestionRoot}
          ${Boolean(this.props.isFocused) && classes.selectedMenuItem}
        `}
        data-qa-selected={Boolean(this.props.isFocused)}
        data-qa-suggestion
        onKeyPress={this.handleClick}
        ref={innerRef}
        {...innerProps}
        // overrides onClick from InnerProps
        onClick={this.handleClick}
        role="button"
        tabIndex={0}
      >
        <div className={classes.resultContainer}>
          <div
            className={`
            ${classes.suggestionItem}
            ${classes.suggestionIcon}
          `}
          >
            <EntityIcon
              loading={status && linodeInTransition(status)}
              size={20}
              status={status}
              variant={icon}
            />
          </div>
          <div
            className={`
            ${classes.suggestionItem}
            ${classes.suggestionContent}
          `}
          >
            <div className={classes.suggestionTitle} data-qa-suggestion-title>
              {this.maybeStyleSegment(
                this.props.data.label,
                searchText,
                classes.highlight
              )}
            </div>
            <div
              className={classes.suggestionDescription}
              data-qa-suggestion-desc
            >
              {suggestion.description}
            </div>
          </div>
        </div>
        <div className={classes.tagContainer}>
          {suggestion.tags &&
            this.renderTags(suggestion.tags, Boolean(this.props.isFocused))}
        </div>
      </div>
    );
  }

  handleClick = () => {
    const suggestion = this.props.data;
    this.props.selectOption(suggestion);
  };

  maybeStyleSegment = (
    text: string,
    searchText: string,
    hlClass: string
  ): React.ReactNode => {
    const idx = text
      .toLocaleLowerCase()
      .indexOf(searchText.toLocaleLowerCase());
    if (idx === -1) {
      return text;
    }
    return (
      <React.Fragment>
        {`${text.substr(0, idx)}`}
        <span className={hlClass}>{`${text.substr(
          idx,
          searchText.length
        )}`}</span>
        {`${text.slice(idx + searchText.length)}`}
      </React.Fragment>
    );
  };

  renderTags = (tags: string[], selected: boolean) => {
    if (tags.length === 0) {
      return;
    }
    return tags.map((tag: string) => (
      <Tag
        asSuggestion={true}
        className="tag"
        closeMenu={this.props.selectProps.onMenuClose}
        colorVariant={selected ? 'blue' : 'lightBlue'}
        component={'button' as 'div'}
        key={`tag-${tag}`}
        label={tag}
      />
    ));
  };
}

export default SearchSuggestion;
