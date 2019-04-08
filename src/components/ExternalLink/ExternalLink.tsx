import * as classNames from 'classnames';
import * as React from 'react';
import Arrow from 'src/assets/icons/diagonalArrow.svg';
import {
  StyleRulesCallback,
  withStyles,
  WithStyles
} from 'src/components/core/styles';

type ClassNames = 'root' | 'icon' | 'absoluteIcon';

const styles: StyleRulesCallback<ClassNames> = theme => ({
  root: {
    display: 'inline-flex',
    alignItems: 'baseline',
    '&:hover': {
      '& $icon': {
        opacity: 1
      }
    }
  },
  icon: {
    color: theme.palette.primary.main,
    position: 'relative',
    left: theme.spacing.unit,
    opacity: 0,
    width: 14,
    height: 14
  },
  absoluteIcon: {
    display: 'inline',
    position: 'relative',
    paddingRight: 26,
    '& $icon': {
      position: 'absolute',
      right: 0,
      bottom: 2,
      opacity: 0,
      left: 'initial'
    }
  }
});

interface Props {
  link: string;
  text: string;
  className?: string;
  absoluteIcon?: boolean;
}

type CombinedProps = Props & WithStyles<ClassNames>;

class ExternalLink extends React.Component<CombinedProps> {
  render() {
    const { classes, link, text, className, absoluteIcon } = this.props;

    return (
      <a
        target="_blank"
        href={link}
        className={classNames(
          {
            [classes.root]: true,
            [classes.absoluteIcon]: absoluteIcon
          },
          className
        )}
        data-qa-external-link
      >
        {text}
        <Arrow className={classes.icon} />
      </a>
    );
  }
}

const styled = withStyles<ClassNames>(styles);

export default styled(ExternalLink);
