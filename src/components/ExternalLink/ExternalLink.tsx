import * as React from 'react';

import { StyleRulesCallback, withStyles, WithStyles } from '@material-ui/core/styles';

import Arrow from 'src/assets/icons/diagonalArrow.svg';

type ClassNames = 'root' | 'icon';

const styles: StyleRulesCallback<ClassNames> = (theme) => ({
  root: {
    display: 'inline-flex',
    alignItems: 'baseline',
  },
  icon: {
    color: theme.palette.primary.main,
    position: 'relative',
    left: theme.spacing.unit,
  },
});

interface Props {
  link: string;
  text: string;
  className?: string;
}

type CombinedProps = Props & WithStyles<ClassNames>;

class ExternalLink extends React.Component<CombinedProps> {

  render() {
    const { classes, link, text, className } = this.props;

    return (
        <a target="_blank" href={link} className={`${classes.root} ${className}`}>
          {text}
          <Arrow className={classes.icon} />
        </a>
    );
  }
}

const styled = withStyles<ClassNames>(styles, { withTheme: true });

export default styled<CombinedProps>(ExternalLink);