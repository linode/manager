import { splitAt } from 'ramda';
import * as React from 'react';
import {
  StyleRulesCallback,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import ShowMore from 'src/components/ShowMore';
import Tag from 'src/components/Tag';

export interface Props {
  tags: string[];
  clickable?: boolean;
}

type ClassNames = 'root' | 'tag';

const styles: StyleRulesCallback<ClassNames> = theme => {
  return {
    root: {},
    tag: {
      color: theme.palette.text.primary,
      fontFamily: 'LatoWeb'
    }
  };
};

type CombinedProps = Props & WithStyles<ClassNames>;

export class Tags extends React.Component<CombinedProps, {}> {
  renderTags = (tags: string[]) => {
    const { classes, clickable } = this.props;
    return tags.map(eachTag => {
      return (
        <Tag
          className={classes.tag}
          label={eachTag}
          key={eachTag}
          clickable={clickable}
          component={'button' as 'div'}
          colorVariant="lightBlue"
        />
      );
    });
  };

  renderMoreTags = (tags: string[]) => {
    return <ShowMore items={tags} render={this.renderTags} />;
  };

  render() {
    const { tags } = this.props;
    if (!tags) {
      return null;
    }
    const [visibleTags, additionalTags] = splitAt(3, tags);
    return (
      <React.Fragment>
        {this.renderTags(visibleTags)}
        {!!additionalTags.length && this.renderMoreTags(additionalTags)}
      </React.Fragment>
    );
  }
}

export default withStyles(styles)(Tags);
