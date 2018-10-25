import * as copy from 'copy-to-clipboard';
import { tail } from 'ramda';
import * as React from 'react';

import { StyleRulesCallback, withStyles, WithStyles } from '@material-ui/core/styles';

import CopyTooltip from 'src/components/CopyTooltip';
import ShowMore from 'src/components/ShowMore';

type CSSClasses =  'root'
| 'left'
| 'right'
| 'icon'
| 'row'
| 'ip'
| 'ipLink';

const styles: StyleRulesCallback<CSSClasses> = (theme) => ({
  '@keyframes popUp': {
    from: {
      opacity: 0,
      top: -10,
      transform: 'scale(.1)',
    },
    to: {
      opacity: 1,
      top: -40,
      transform: 'scale(1)',
    },
  },
  root: {
    marginBottom: theme.spacing.unit / 2,
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
    '& svg': {
      top: 1,
      width: 14,
      height: 14,
    },
  },
  ip: {
    color: theme.palette.text.primary,
    fontSize: '.9rem',
  },
  ipLink: {
    color: theme.palette.primary.main,
    position: 'relative',
    display: 'inline-block',
    width: 28,
    transition: theme.transitions.create(['color']),
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

    return (
      <div className={classes.ipLink} data-qa-copy-ip>
        <CopyTooltip
          text={ip}
          className={`${classes.icon} ${copyRight ? classes.right : classes.left}`}
        />
      </div>
    );
  }

  renderIP = (ip: string, copyRight?: Boolean, key?: number) => {
    const { classes } = this.props;
    return (
      <div key={key} className={classes.row}>
        <div className={`${classes.ip} ${'ip'}`}>{ip}</div>
        {copyRight && this.renderCopyIcon(ip)}
      </div>
    );
  }

  render() {
    const { classes, ips, copyRight } = this.props;
    const privateIPRegex = /^10\.|^172\.1[6-9]\.|^172\.2[0-9]\.|^172\.3[0-1]\.|^192\.168\.|^fd/;
    const formattedIPS = ips
      .map(ip => ip.replace('/64', ''))
      .sort(ip => !!ip.match(privateIPRegex) ? 1 : 0);

    return (
      <div className={`dif ${classes.root}`}>
        { this.renderIP(formattedIPS[0], copyRight) }
        {
          formattedIPS.length > 1 && <ShowMore
            items={tail(formattedIPS)}
            render={(ipsAsArray: string[]) => {
              return ipsAsArray.map((ip, idx) => this.renderIP(ip.replace('/64', ''), copyRight, idx));
            }} />
        }
      </div>
    );
  }
}

export default withStyles(styles, { withTheme: true })(IPAddress);
