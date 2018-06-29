import * as React from 'react';

import * as classNames from 'classnames';

import { StyleRulesCallback, Theme, withStyles, WithStyles } from '@material-ui/core/styles';

import * as copy from 'copy-to-clipboard';

import { ContentCopy } from '@material-ui/icons';

interface Props {
  text: string;
  className?: string;
  standAlone?: boolean;
}

interface State {
  copied: boolean;
}

type CSSClasses =  'root'
| 'copied'
| 'standAlone';

const styles: StyleRulesCallback<CSSClasses> = (theme: Theme & Linode.Theme) => ({
  '@keyframes popUp': {
    from: {
      opacity: 0,
      top: -10,
      transform: 'scale(.1)',
    },
    to: {
      opacity: 1,
      top: -45,
      transform: 'scale(1)',
    },
  },
  root: {
    position: 'relative',
    padding: 2,
    transition: theme.transitions.create(['background-color']),
    borderRadius: 4,
    color: theme.palette.text.primary,
    '& svg': {
      transition: theme.transitions.create(['color']),
      margin: 0,
      position: 'relative',
      width: 16,
      height: 16,
    },
    '&:hover': {
      backgroundColor: theme.palette.text.primary,
      '& svg': {
        color: 'white',
      },
    },
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
    animation: 'popUp 200ms ease-in-out forwards',
  },
  standAlone: {
    marginLeft: theme.spacing.unit,
    '& svg': {
      width: 14,
    },
  },
});

type CombinedProps = Props & WithStyles<CSSClasses>;

class CopyTooltip extends React.Component<CombinedProps, State> {
  state = {
    copied: false,
  };

  clickIcon = (value: string) => {
    this.setState({
      copied: true,
    });
    window.setTimeout(() => this.setState({ copied: false }), 1500);
    copy(value);
  }

  render() {
    const { classes, text, className, standAlone } = this.props;
    const { copied } = this.state;

    return (
      <a
        aria-label={text}
        title={text}
        onClick={() => this.clickIcon(text)}
        href="javascript:void(0)"
        className={classNames(
          className,
          {
          [classes.root]: true,
          [classes.standAlone]: standAlone,
        })}
      >
        {copied && <span className={classes.copied} data-qa-copied>copied</span>}
        <ContentCopy />
      </a>
    );
  }
}

const styled = withStyles(styles, { withTheme: true });

export default styled(CopyTooltip);
