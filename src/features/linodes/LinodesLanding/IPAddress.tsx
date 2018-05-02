import * as React from 'react';
import {
  withStyles,
  Theme,
  WithStyles,
  StyleRulesCallback,
} from 'material-ui/styles';
import * as copy from 'copy-to-clipboard';
import { tail } from 'ramda';

import LinodeTheme from 'src/theme';
import ShowMore from 'src/components/ShowMore';
import ContentCopyIcon from 'material-ui-icons/ContentCopy';

type CSSClasses =  'root'
| 'left'
| 'right'
| 'icon'
| 'row'
| 'ipLink'
| 'copied';

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
    alignItems: 'center',
    marginBottom: theme.spacing.unit / 2,
    width: '100%',
    '&:last-child': {
      marginBottom: 0,
    },
  },
  row: {
    display: 'flex',
    alignItems: 'center',
  },
  left: {
    marginLeft: theme.spacing.unit,
  },
  right: {
    marginLeft: theme.spacing.unit,
  },
  icon: {
    marginRight: theme.spacing.unit,
    height: 18,
    width: 18,
    padding: '3px',
    transition: theme.transitions.create(['background-color']),
    borderRadius: 2,
    position: 'absolute',
    top: -9,
  },
  ipLink: {
    color: LinodeTheme.palette.primary.main,
    position: 'relative',
    display: 'inline-block',
    width: 28,
    transition: theme.transitions.create(['color']),
    '&:hover, &:focus': {
      color: 'white',
      '& $icon': {
        backgroundColor: theme.palette.primary.light,
      },
    },
  },
  copied: {
    fontSize: '.85rem',
    left: -12,
    color: LinodeTheme.palette.primary.light,
    padding: '6px 8px',
    backgroundColor: 'white',
    position: 'absolute',
    boxShadow: '0 0 5px #ddd',
    transition: 'opacity .5s ease-in-out',
    animation: 'popUp 200ms ease-in-out forwards',
  },
});

interface Props {
  ips: string[];
  copyRight?: boolean;
}

interface State {
  copied: string;
}

class IPAddress extends React.Component<Props & WithStyles<CSSClasses>, State> {
  state = {
    copied: '',
  };

  copiedTimeout: number | null = null;

  componentWillUnmount() {
    if (this.copiedTimeout !== null) {
      window.clearTimeout(this.copiedTimeout);
    }
  }

  clickIcon = (ip: string) => {
    this.setState({ copied: ip });
    window.setTimeout(() => this.setState({ copied: '' }), 1500);
    copy(ip);
  }

  renderCopyIcon = (ip: string) => {
    const { classes, copyRight } = this.props;
    const { copied } = this.state;

    return (
      <a
        aria-label="Copy IP address"
        className={classes.ipLink}
        title={ip}
        onClick={() => this.clickIcon(ip)}
        href="javascript:void(0)"
        data-qa-copy-ip
      >
        {(copied === ip) && <span className={classes.copied} data-qa-copied>copied</span>}
        <ContentCopyIcon
          className={`${classes.icon} ${copyRight ? classes.right : classes.left}`}
        />
      </a>
    );
  }

  renderIP = (ip: string, copyRight?: Boolean, key?: number) => {
    const { classes } = this.props;
    return (
      <div key={key} className={classes.row}>
        <div className="ip">{ip}</div>
        {copyRight && this.renderCopyIcon(ip)}
      </div>
    );
  }

  render() {
    const { classes, ips, copyRight } = this.props;
    const formattedIPS = ips.map(ip => ip.replace('/64', ''));

    return (
      <div className={`dif ${classes.root}`}>
        { this.renderIP(formattedIPS[0], copyRight) }
        {
          formattedIPS.length > 1 && <ShowMore
            items={tail(formattedIPS)}
            render={(ips: string[]) => {
              return ips.map((ip, idx) => this.renderIP(ip.replace('/64', ''), copyRight, idx));
            }} />
        }
      </div>
    );
  }
}

export default withStyles(styles, { withTheme: true })(IPAddress);
