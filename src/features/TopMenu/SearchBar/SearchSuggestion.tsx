import * as React from 'react';
import { OptionProps } from 'react-select/lib/components/Option';

import Tag from 'src/components/Tag';

export interface SearchSuggestionT {
  Icon: React.ComponentClass<any>;
  description: string;
  path: string;
  searchText: string;
  history: any;
  tags?: string[];
  isHighlighted?: boolean;
}

interface Props extends OptionProps<any> {
  data: {
    label: string;
    data: SearchSuggestionT;
  }
}

type CombinedProps = Props;

class SearchSuggestion extends React.Component<CombinedProps> {
  maybeStyleSegment = (text: string, searchText: string, hlClass: string): React.ReactNode => {
    const idx = text.toLocaleLowerCase().indexOf(searchText.toLocaleLowerCase());
    if (idx === -1) { return text; }
    return (
      <React.Fragment>
        {`${text.substr(0, idx)}`}
          <span className={hlClass}>{`${text.substr(idx, searchText.length)}`}</span>
        {`${text.slice(idx + searchText.length)}`}
      </React.Fragment>
    );
  };

  renderTags = (tags:string[], selected:boolean) => {
    if (tags.length === 0) { return; }
    return tags.map((tag:string) =>
      <Tag
        key={`tag-${tag}`}
        label={tag}
        variant={selected ? 'blue' : 'lightGray'}
      />
    );
  }

  handleClick = () => {
    const suggestion = this.props.data;
    this.props.selectOption(suggestion);
  }

  render() {
    const suggestion = this.props.data.data;
    const { classes } = this.props.selectProps;
    const { Icon } = suggestion;
    const { innerRef, innerProps } = this.props;
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
      >
        <div className={classes.resultContainer}>
          <div className={`
            ${classes.suggestionItem}
            ${classes.suggestionIcon}
          `}>
            <Icon />
          </div>
          <div className={`
            ${classes.suggestionItem}
            ${classes.suggestionContent}
          `}>
            <div className={classes.suggestionTitle} data-qa-suggestion-title>
              {this.maybeStyleSegment(this.props.data.label, suggestion.searchText, classes.highlight)}
            </div>
            <div className={classes.suggestionDescription} data-qa-suggestion-desc>
              {suggestion.description}
            </div>
          </div>
        </div>
        <div className={classes.tagContainer}>
            {suggestion.tags && this.renderTags(suggestion.tags, Boolean(this.props.isFocused))}
        </div>
      </div>
    );
  }
};


export default SearchSuggestion;
