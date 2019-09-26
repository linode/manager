import * as classNames from 'classnames';
import * as React from 'react';

import OpenInNew from '@material-ui/icons/OpenInNew';

import Arrow from 'src/assets/icons/diagonalArrow.svg';
import {
  createStyles,
  Theme,
  withStyles,
  WithStyles
} from 'src/components/core/styles';

type ClassNames = 'root' | 'icon' | 'absoluteIcon' | 'black' | 'fixedIcon';

const styles = (theme: Theme) =>
  createStyles({
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
      left: theme.spacing(1),
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
    },
    fixedIcon: {
      display: 'inline-block',
      fontSize: '0.8em'
    },
    black: {
      color: theme.palette.text.primary
    }
  });

interface Props {
  link: string;
  text: string;
  className?: string;
  absoluteIcon?: boolean;
  black?: boolean;
  fixedIcon?: boolean;
}

type CombinedProps = Props & WithStyles<ClassNames>;

class ExternalLink extends React.Component<CombinedProps> {
  render() {
    const {
      classes,
      link,
      text,
      className,
      absoluteIcon,
      black,
      fixedIcon
    } = this.props;

    return (
      <a
        target="_blank"
        rel="noopener noreferrer"
        href={link}
        className={classNames(
          {
            [classes.root]: true,
            [classes.absoluteIcon]: absoluteIcon,
            [classes.black]: black
          },
          className
        )}
        data-qa-external-link
      >
        {text}
        {fixedIcon ? (
          <OpenInNew className={classes.fixedIcon} />
        ) : (
          <Arrow className={classes.icon} />
        )}
      </a>
    );
  }
}

const styled = withStyles(styles);

export default styled(ExternalLink);
