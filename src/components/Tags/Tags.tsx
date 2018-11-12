import { splitAt } from 'ramda';
import * as React from 'react';

import { StyleRulesCallback, withStyles, WithStyles } from '@material-ui/core/styles';

import ShowMore from 'src/components/ShowMore';
import Tag from 'src/components/Tag';

export interface Props {
  tags: string[];
}

type ClassNames = 'root'
  | 'tag';

const styles: StyleRulesCallback<ClassNames> = (theme) => {
  return ({
    root: {},
    tag: {
      marginTop: theme.spacing.unit / 2,
      marginRight: theme.spacing.unit,
      padding: theme.spacing.unit / 2,
      backgroundColor: theme.color.grey2,
      color: theme.palette.text.primary,
      fontFamily: 'LatoWeb',
      '&:focus': {
        backgroundColor: theme.color.grey2,
      },
      '& > span': {
        position: 'relative',
        top: -2,
      },
    },
  });
};

type CombinedProps = Props & WithStyles<ClassNames>;

class Tags extends React.Component<CombinedProps, {}> {
  renderTag = (tags: string[]) => {
    const { classes } = this.props;
    return tags.map(eachTag => {
      return (
        <Tag
          className={classes.tag}
          label={eachTag}
          key={eachTag}
          clickable={false}
        />
      )
    })
  }

  renderMoreTags = (tags: string[]) => {
    return (
      <ShowMore
        items={tags}
        render={this.renderTag}
      />
    )
  }

  render() {
    const { tags } = this.props;
    const [visibleTags, additionalTags] = splitAt(3, tags);
    const { classes } = this.props;
    return (
      <React.Fragment>
        {
          visibleTags.map((eachTag: string) => {
            return (
              <Tag
                label={eachTag}
                key={eachTag}
                className={classes.tag}
                clickable={false}
              />
            )
          })
        }
        {!!additionalTags.length && this.renderMoreTags(additionalTags)}
      </React.Fragment>
    )
  }


};

export default withStyles(styles, { withTheme: true })(Tags);
