import * as React from 'react';
import {
  withStyles,
  WithStyles,
  StyleRulesCallback,
  Theme,
} from 'material-ui';

import Typography from 'material-ui/Typography';
import LinodeTheme from 'src/theme';

export interface Doc {
  title: string;
  src: string;
  body: string;
}

type CSSClasses = 'root'
| 'title'
| 'titleLink'
| 'body';

const styles: StyleRulesCallback<CSSClasses> = (theme: Theme & Linode.Theme) => ({
  root: {
    marginTop: theme.spacing.unit * 2,
  },
  title: {},
  titleLink: {
    textDecoration: 'none',
    color: LinodeTheme.color.headline,
    '&:hover, &:focus': {
      textDecoration: 'underline',
    },
  },
  body: {
    marginTop: theme.spacing.unit,
  },
});

interface Props extends Doc {}

type PropsWithStyles = Props & WithStyles<CSSClasses>;

class DocComponent extends React.Component<PropsWithStyles> {
  render() {
    const { classes, src, title, body } = this.props;

    return (
      <React.Fragment>
        <div className={classes.root}>
          <Typography variant="subheading" className={classes.title}>
            <a href={src} target="_blank" className={classes.titleLink}>{title}</a>
          </Typography>
          <Typography variant="body2" className={classes.body}>
            {body}
          </Typography>
        </div>
      </React.Fragment>
    );
  }
}

export default withStyles(styles, { withTheme: true })<Props>(DocComponent);
