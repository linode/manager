import * as React from 'react';
import {
  withStyles,
  WithStyles,
  StyleRulesCallback,
} from 'material-ui';

export interface Doc {
  title: string;
  src: string;
  body: string;
}

type CSSClasses = 'root' | 'title' | 'body';

type DocWithStyles = Doc & WithStyles<CSSClasses>;

const styles: StyleRulesCallback<CSSClasses> = theme => ({
  root: {
    borderBottom: 'solid 1px black',
    '&:last-child': {
      borderBottom: '0',
    },
  },
  title: {},
  body: {},
});

class DocComponent extends React.Component<DocWithStyles> {
  render() {
    const { classes, src, title, body } = this.props;

    return (
      <div className={classes.root}>
        <div className={classes.title}><a href={src}>{title}</a></div>
        <div className={classes.body}>{body}</div>
      </div>
    );
  }
}

export default withStyles(styles, { withTheme: true })<Doc>(DocComponent);
