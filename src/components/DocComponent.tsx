import * as React from 'react';
import {
  withStyles,
  WithStyles,
  StyleRulesCallback,
} from 'material-ui';
import Divider from 'material-ui/Divider';

import ExitToApp from 'material-ui-icons/ExitToApp';

export interface Doc {
  title: string;
  src: string;
  body: string;
}

type CSSClasses = 'root' | 'title' | 'icon' | 'body';

const styles: StyleRulesCallback<CSSClasses> = theme => ({
  root: {},
  title: {},
  icon: {
    height: '16px',
    width: '16px',
    marginLeft: '10px',
  },
  body: {},
});

interface Props extends Doc {
  key: number;
  count: number;
}

type DocWithStyles = Props & WithStyles<CSSClasses>;

class DocComponent extends React.Component<DocWithStyles> {
  render() {
    const { classes, src, title, body, key, count } = this.props;

    return (
      <React.Fragment>
        <div className={classes.root}>
          <div className={classes.title}>
            <a href={src}>{title}
              <ExitToApp className={classes.icon} />
            </a>
          </div>
          <div className={classes.body}>{body}</div>
        </div>
        {key !== count && <Divider />}
      </React.Fragment>
    );
  }
}

export default withStyles(styles, { withTheme: true })<Props>(DocComponent);
