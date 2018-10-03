import * as React from 'react';

import { StyleRulesCallback, withStyles, WithStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';

import truncateText from 'src/utilities/truncateText';

export interface Doc {
  title: string;
  src: string;
  body: string;
}

type CSSClasses = 'root'
| 'title'
| 'titleLink'
| 'body';

const styles: StyleRulesCallback<CSSClasses> = (theme) => ({
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

type PropsWithStyles = Doc & WithStyles<CSSClasses>;

class DocComponent extends React.PureComponent<PropsWithStyles> {

  body = () => {
    const { body } = this.props;
    return truncateText(body, 200);
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

export default withStyles(styles, { withTheme: true })<PropsWithStyles>(DocComponent);
