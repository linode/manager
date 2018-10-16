import * as React from 'react';
import { OptionProps } from 'react-select/lib/components/Option';

import { StyleRulesCallback, withStyles, WithStyles } from '@material-ui/core/styles';

type ClassNames = 'root'
 | 'highlight'
 | 'suggestionItem'
 | 'suggestionIcon'
 | 'suggestionContent'
 | 'suggestionTitle'
 | 'suggestionDescription'
 | 'resultContainer'
 | 'tagContainer';

 import Tag from 'src/components/Tag';

const styles: StyleRulesCallback<ClassNames> = (theme) => ({
  root: {
    cursor: 'pointer',
    display: 'flex',
    width: '100%',
    alignItems: 'space-between',
    justifyContent: 'space-between',
  },
  highlight: {
    color: theme.palette.primary.main,
  },
  suggestionItem: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
  },
  suggestionIcon: {
    '& svg': {
      width: '40px',
      height: '40px',
    },
  },
  suggestionContent: {
    marginLeft: theme.spacing.unit * 2,
  },
  suggestionTitle: {
    fontSize: '1rem',
    color: theme.palette.text.primary,
  },
  suggestionDescription: {
    color: theme.color.headline,
    fontSize: '.8rem',
    fontWeight: 600,
    marginTop: 2,
  },
  resultContainer: {
    display: 'flex',
    flexFlow: 'row nowrap'
  },
  tagContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    '& > div': {
      margin: '2px',
    }
  }
});

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

type CombinedProps = Props & WithStyles<ClassNames>;

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
    const { classes } = this.props;
    const { Icon } = suggestion;
    return (
      <div
        className={classes.root}
        onClick={this.handleClick}
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

const styled = withStyles(styles, { withTheme: true });

export default styled<Props>(SearchSuggestion);
