import { WithStyles } from '@material-ui/core/styles';
import * as React from 'react';
import { createStyles, Theme, withStyles } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import ExternalLink from 'src/components/ExternalLink';
import truncateText from 'src/utilities/truncateText';

export interface Doc {
  title: string;
  src: string;
  body: string;
}

type CSSClasses = 'root' | 'title' | 'titleLink' | 'body';

const styles = (theme: Theme) =>
  createStyles({
    root: {
      marginTop: theme.spacing(2)
    },
    title: {},
    titleLink: {
      color: theme.color.headline,
      textDecoration: 'underline',
      '&:hover': {
        color: theme.color.black
      }
    },
    body: {
      marginTop: theme.spacing(1)
    }
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
          <Typography variant="h3" className={classes.title}>
            <ExternalLink text={title} link={src} absoluteIcon black />
          </Typography>
          <Typography variant="body2" className={classes.body}>
            {this.body()}
          </Typography>
        </div>
      </React.Fragment>
    );
  }
}

const styled = withStyles(styles);

export default styled(DocComponent);
