import * as React from 'react';
import {
  createStyles,
  Theme,
  withStyles,
  WithStyles,
} from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import ExternalLink from 'src/components/ExternalLink';
import { truncate } from 'src/utilities/truncate';

export interface Doc {
  title: string;
  src: string;
  body: string;
}

type ClassNames = 'root' | 'body';

const styles = (theme: Theme) =>
  createStyles({
    root: {
      marginTop: theme.spacing(2),
    },
    body: {
      marginTop: theme.spacing(),
    },
  });

type PropsWithStyles = Doc & WithStyles<ClassNames>;

class DocComponent extends React.PureComponent<PropsWithStyles> {
  body = () => {
    const { body } = this.props;
    return truncate(body, 200);
  };

  render() {
    const { classes, src, title } = this.props;

    return (
      <div className={classes.root} data-qa-doc={title}>
        <Typography variant="h3">
          <ExternalLink text={title} link={src} absoluteIcon black />
        </Typography>
        <Typography variant="body1" className={classes.body}>
          {this.body()}
        </Typography>
      </div>
    );
  }
}

const styled = withStyles(styles);

export default styled(DocComponent);
