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
      top: -35,
      transform: 'scale(1)',
    },
  },
  root: {
    alignItems: 'center',
    marginBottom: 2,
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
    height: 13,
    width: 18,
    padding: '0 3px',
    transition: 'backgroundColor 225ms ease-in-out, color 225ms ease-in-out',
    borderRadius: 2,
  },
  ipLink: {
    color: LinodeTheme.palette.primary.main,
    position: 'relative',
    display: 'inline-block',
    '&:hover': {
      color: theme.palette.primary.light,
      cursor: 'pointer',
    },
    '&:focus $icon': {
      backgroundColor: theme.palette.primary.light,
      color: 'white',
    },
  },
  copied: {
    fontSize: '.85rem',
    left: -12,
    color: LinodeTheme.palette.primary.light,
    padding: `${theme.spacing.unit / 2}px ${theme.spacing.unit}px`,
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

class IPAddress extends React.Component<Props & WithStyles<CSSClasses>> {
  state = {
    copied: false,
  };

  copiedTimeout: number | null = null;

  componentWillUnmount() {
    if (this.copiedTimeout !== null) {
      window.clearTimeout(this.copiedTimeout);
    }
  }

  clickIcon = (ip: string) => {
    this.setState({
      copied: true,
    });
    window.setTimeout(() => this.setState({ copied: false }), 1500);
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
      >
        {copied && <span className={classes.copied}>copied</span>}
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
