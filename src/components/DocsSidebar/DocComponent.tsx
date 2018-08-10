import { take } from 'ramda';
import * as React from 'react';

import { StyleRulesCallback, Theme, withStyles, WithStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';

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
    color: theme.color.headline,
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

class DocComponent extends React.PureComponent<PropsWithStyles> {

  body = () => {
    const { body } = this.props;
    return body.length > 203 ? truncateText(body, 200) : body;
  };

  render() {
    const { classes, src, title } = this.props;

    return (
      <React.Fragment>
        <div className={classes.root} data-qa-doc={title}>
          <Typography role="header" variant="subheading" className={classes.title}>
            <a href={src} target="_blank" className={classes.titleLink}>{title}</a>
          </Typography>
          <Typography variant="body2" className={classes.body}>
            {this.body()}
          </Typography>
        </div>
      </React.Fragment>
    );
  }
}

const truncateText = (str: string, len: number) => `${take(len, str)}...`;

export default withStyles(styles, { withTheme: true })<Props>(DocComponent);
