import { LinodeStatus } from 'linode-js-sdk/lib/linodes';
import { pathOr } from 'ramda';
import * as React from 'react';
import { OptionProps } from 'react-select/lib/components/Option';

import EntityIcon from 'src/components/EntityIcon';
import Tag from 'src/components/Tag';
import { linodeInTransition } from 'src/features/linodes/transitions';

export interface SearchSuggestionT {
  icon: string;
  description: string;
  path: string;
  searchText: string;
  history: any;
  tags?: string[];
  isHighlighted?: boolean;
  status?: LinodeStatus;
}

interface Props extends OptionProps<any> {
  data: {
    label: string;
    data: SearchSuggestionT;
  };
  searchText: string;
}

type CombinedProps = Props;

class SearchSuggestion extends React.Component<CombinedProps> {
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
        key={`tag-${tag}`}
        label={tag}
        clickable
        colorVariant={selected ? 'blue' : 'lightBlue'}
        component={'button' as 'div'}
        asSuggestion={true}
        className="tag"
        closeMenu={this.props.selectProps.onMenuClose}
      />
    ));
  };

  handleClick = () => {
    const suggestion = this.props.data;
    this.props.selectOption(suggestion);
  };

  render() {
    const suggestion = this.props.data.data;
    const { classes } = this.props.selectProps;
    const { icon } = pathOr<string>('default', [], suggestion);
    const { searchText } = suggestion;
    const { innerRef, innerProps } = this.props;
    const { status } = suggestion;
    return (
      <div
        className={`
          ${classes.suggestionRoot}
          ${Boolean(this.props.isFocused) && classes.selectedMenuItem}
        `}
        data-qa-suggestion
        data-qa-selected={Boolean(this.props.isFocused)}
        ref={innerRef}
        onClick={this.handleClick}
        {...innerProps}
        role="button"
      >
        <div className={classes.resultContainer}>
          <div
            className={`
            ${classes.suggestionItem}
            ${classes.suggestionIcon}
          `}
          >
            <EntityIcon
              variant={icon}
              status={status && status}
              marginTop={3}
              loading={status && linodeInTransition(status)}
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
}

export default SearchSuggestion;
