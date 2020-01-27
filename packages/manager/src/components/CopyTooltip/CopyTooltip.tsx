import * as classNames from 'classnames';
import * as copy from 'copy-to-clipboard';
import * as React from 'react';
import FileCopy from 'src/assets/icons/copy.svg';
import {
  createStyles,
  Theme,
  withStyles,
  WithStyles
} from 'src/components/core/styles';

interface Props {
  text: string;
  className?: string;
  standAlone?: boolean;
  ariaLabel?: string;
}

interface State {
  copied: boolean;
}

type CSSClasses = 'root' | 'copied' | 'standAlone';

const styles = (theme: Theme) =>
  createStyles({
    '@keyframes popUp': {
      from: {
        opacity: 0,
        top: -10,
        transform: 'scale(.1)'
      },
      to: {
        opacity: 1,
        top: -45,
        transform: 'scale(1)'
      }
    },
    root: {
      position: 'relative',
      padding: 4,
      backgroundColor: 'transparent',
      transition: theme.transitions.create(['background-color']),
      borderRadius: 4,
      border: 'none',
      cursor: 'pointer',
      color: theme.color.grey1,
      '& svg': {
        transition: theme.transitions.create(['color']),
        color: theme.color.grey1,
        margin: 0,
        position: 'relative',
        width: 20,
        height: 20
      },
      '&:hover': {
        backgroundColor: theme.color.white
      }
    },
    copied: {
      fontSize: '.85rem',
      left: -16,
      color: theme.palette.text.primary,
      padding: '6px 8px',
      backgroundColor: theme.color.white,
      position: 'absolute',
      boxShadow: `0 0 5px ${theme.color.boxShadow}`,
      transition: 'opacity .5s ease-in-out',
      animation: '$popUp 200ms ease-in-out forwards'
    },
    standAlone: {
      marginLeft: theme.spacing(1),
      '& svg': {
        width: 14
      }
    }
  });

type CombinedProps = Props & WithStyles<CSSClasses>;

class CopyTooltip extends React.Component<CombinedProps, State> {
  state = {
    copied: false
  };

  clickIcon = () => {
    this.setState({
      copied: true
    });
    window.setTimeout(() => this.setState({ copied: false }), 1500);
    copy(this.props.text);
  };

  render() {
    const { classes, text, className, standAlone, ariaLabel } = this.props;
    const { copied } = this.state;

    return (
      <button
        aria-label={ariaLabel ? ariaLabel : text}
        name={text}
        type="button"
        onClick={this.clickIcon}
        className={classNames(className, {
          [classes.root]: true,
          [classes.standAlone]: standAlone
        })}
      >
        {copied && (
          <span className={classes.copied} data-qa-copied>
            copied
          </span>
        )}
        <FileCopy />
      </button>
    );
  }
}

const styled = withStyles(styles);

export default styled(CopyTooltip);
