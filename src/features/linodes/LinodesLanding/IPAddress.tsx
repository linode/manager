import * as copy from 'copy-to-clipboard';
import { tail } from 'ramda';
import * as React from 'react';
import CopyTooltip from 'src/components/CopyTooltip';
import {
  StyleRulesCallback,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import ShowMore from 'src/components/ShowMore';

type CSSClasses =
  | 'root'
  | 'left'
  | 'right'
  | 'icon'
  | 'row'
  | 'multipleAddresses'
  | 'ip'
  | 'ipLink'
  | 'hide';

const styles: StyleRulesCallback<CSSClasses> = theme => ({
  '@keyframes popUp': {
    from: {
      opacity: 0,
      top: -10,
      transform: 'scale(.1)'
    },
    to: {
      opacity: 1,
      top: -40,
      transform: 'scale(1)'
    }
  },
  root: {
    marginBottom: theme.spacing.unit / 2,
    width: '100%',
    maxWidth: '100%',
    '&:last-child': {
      marginBottom: 0
    },
    '&:hover': {
      '& $hide': {
        opacity: 1
      }
    }
  },
  row: {
    display: 'flex',
    alignItems: 'flex-start',
    width: '100%'
  },
  multipleAddresses: {
    '&:not(:last-child)': {
      marginBottom: theme.spacing.unit
    }
  },
  left: {
    marginLeft: theme.spacing.unit
  },
  right: {
    marginLeft: theme.spacing.unit,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  icon: {
    '& svg': {
      top: 1,
      width: 12,
      height: 12
    }
  },
  ip: {
    color: theme.palette.text.primary,
    fontSize: '.9rem'
  },
  ipLink: {
    color: theme.palette.primary.main,
    position: 'relative',
    display: 'inline-block',
    width: 28,
    transition: theme.transitions.create(['color'])
  },
  hide: {
    [theme.breakpoints.up('md')]: {
      // Hide until the component is hovered, when props.showCopyOnHover is true (only on desktop)
      opacity: 0
    },
    transition: theme.transitions.create(['opacity']),
    '&:focus': {
      opacity: 1
    }
  }
});

interface Props {
  ips: string[];
  copyRight?: boolean;
  showCopyOnHover?: boolean;
  showMore?: boolean;
  showAll?: boolean;
}

const privateIPRegex = /^10\.|^172\.1[6-9]\.|^172\.2[0-9]\.|^172\.3[0-1]\.|^192\.168\.|^fd/;

export const sortIPAddress = (ip1: string, ip2: string) =>
  (privateIPRegex.test(ip1) ? 1 : -1) - (privateIPRegex.test(ip2) ? 1 : -1);

export class IPAddress extends React.Component<Props & WithStyles<CSSClasses>> {
  state = {
    copied: false
  };

  copiedTimeout: number | null = null;

  componentWillUnmount() {
    if (this.copiedTimeout !== null) {
      window.clearTimeout(this.copiedTimeout);
    }
  }

  clickIcon = (ip: string) => {
    this.setState({
      copied: true
    });
    window.setTimeout(() => this.setState({ copied: false }), 1500);
    copy(ip);
  };

  renderCopyIcon = (ip: string) => {
    const { classes, copyRight, showCopyOnHover } = this.props;

    return (
      <div className={`${classes.ipLink}`} data-qa-copy-ip>
        <CopyTooltip
          text={ip}
          className={`${classes.icon} ${showCopyOnHover ? classes.hide : ''}
            ${copyRight ? classes.right : classes.left} copy`}
        />
      </div>
    );
  };

  renderIP = (ip: string, copyRight?: Boolean, key?: number) => {
    const { classes, showAll } = this.props;
    return (
      <div
        key={key}
        className={`${classes.row} ${showAll && classes.multipleAddresses}`}
      >
        <div className={`${classes.ip} ${'ip xScroll'}`} data-qa-ip-main>
          {ip}
        </div>
        {copyRight && this.renderCopyIcon(ip)}
      </div>
    );
  };

  render() {
    const { classes, ips, copyRight, showMore, showAll } = this.props;

    const formattedIPS = ips
      .map(ip => ip.replace('/64', ''))
      .sort(sortIPAddress);

    return (
      <div className={`${!showAll && 'dif'} ${classes.root}`}>
        {!showAll
          ? this.renderIP(formattedIPS[0], copyRight)
          : formattedIPS.map((a, i) => {
              return this.renderIP(a, copyRight, i);
            })}

        {formattedIPS.length > 1 && showMore && !showAll && (
          <ShowMore
            items={tail(formattedIPS)}
            render={(ipsAsArray: string[]) => {
              return ipsAsArray.map((ip, idx) =>
                this.renderIP(ip.replace('/64', ''), copyRight, idx)
              );
            }}
            data-qa-ip-more
          />
        )}
      </div>
    );
  }
}

export default withStyles(styles)(IPAddress);
