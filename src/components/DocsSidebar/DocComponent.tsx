import * as React from 'react';
import MenuItem from 'src/components/core/MenuItem';
import { StyleRulesCallback, withStyles, WithStyles } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
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
    flexDirection: 'column',
    alignItems: 'flex-start',
    '&:hover': {
      backgroundColor: 'transparent'
    }
  },
  title: {},
  titleLink: {
    color: theme.color.headline,
    textDecoration: 'underline',
    '&:hover': {
      color: theme.color.black,
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
        <MenuItem className={classes.root} data-qa-doc={title} disableGutters button={false}>
          <Typography role="header" variant="h3" className={classes.title}>
            <a href={src} target="_blank" className={classes.titleLink}>{title}</a>
          </Typography>
          <Typography variant="body2" className={classes.body}>
            {this.body()}
          </Typography>
        </MenuItem>
      </React.Fragment>
    );
  }
}

const styled = withStyles(styles);

export default styled(DocComponent);
