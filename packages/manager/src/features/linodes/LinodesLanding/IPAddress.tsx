import copy from 'copy-to-clipboard';
import { tail } from 'ramda';
import * as React from 'react';
import CopyTooltip from 'src/components/CopyTooltip';
import {
  createStyles,
  Theme,
  withStyles,
  WithStyles,
} from 'src/components/core/styles';
import ShowMore from 'src/components/ShowMore';
import { privateIPRegex } from 'src/utilities/ipUtils';

type CSSClasses =
  | 'root'
  | 'right'
  | 'icon'
  | 'row'
  | 'multipleAddresses'
  | 'ipLink'
  | 'hide';

const styles = (theme: Theme) =>
  createStyles({
    root: {
      marginBottom: theme.spacing() / 2,
      maxWidth: '100%',
      width: '100%',
      '&:last-child': {
        marginBottom: 0,
      },
      '&:hover': {
        '& $hide': {
          opacity: 1,
        },
      },
    },
    row: {
      display: 'flex',
      alignItems: 'flex-start',
      width: '100%',
    },
    multipleAddresses: {
      '&:not(:last-child)': {
        marginBottom: theme.spacing() / 2,
      },
    },
    right: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginLeft: theme.spacing(0.5),
    },
    icon: {
      '& svg': {
        height: 12,
        width: 12,
        top: 1,
      },
    },
    ipLink: {
      display: 'inline-block',
      color: theme.palette.primary.main,
      position: 'relative',
      top: -1,
      transition: theme.transitions.create(['color']),
    },
    hide: {
      [theme.breakpoints.up('md')]: {
        // Hide until the component is hovered,
        // when props.showCopyOnHover is true (only on desktop)
        opacity: 0,
      },
      transition: theme.transitions.create(['opacity']),
      '&:focus': {
        opacity: 1,
      },
    },
  });

interface Props {
  ips: string[];
  showCopyOnHover?: boolean;
  showMore?: boolean;
  showAll?: boolean;
}

export const sortIPAddress = (ip1: string, ip2: string) =>
  (privateIPRegex.test(ip1) ? 1 : -1) - (privateIPRegex.test(ip2) ? 1 : -1);

export class IPAddress extends React.Component<Props & WithStyles<CSSClasses>> {
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
  };

  renderCopyIcon = (ip: string) => {
    const { classes, showCopyOnHover } = this.props;

    return (
      <div className={`${classes.ipLink}`} data-qa-copy-ip>
        <CopyTooltip
          text={ip}
          className={`${classes.icon} ${showCopyOnHover ? classes.hide : ''}
            ${classes.right} copy`}
        />
      </div>
    );
  };

  renderIP = (ip: string, key?: number) => {
    const { classes, showAll } = this.props;
    return (
      <div
        key={key}
        className={`${classes.row} ${showAll && classes.multipleAddresses}`}
        data-qa-ip-main
      >
        {ip}
        {this.renderCopyIcon(ip)}
      </div>
    );
  };

  render() {
    const { classes, ips, showMore, showAll } = this.props;

    const formattedIPS = ips
      .map((ip) => ip.replace('/64', ''))
      .sort(sortIPAddress);

    return (
      <div className={`${!showAll && 'dif'} ${classes.root}`}>
        {!showAll
          ? this.renderIP(formattedIPS[0])
          : formattedIPS.map((a, i) => {
              return this.renderIP(a, i);
            })}

        {formattedIPS.length > 1 && showMore && !showAll && (
          <ShowMore
            items={tail(formattedIPS)}
            ariaItemType="IP addresses"
            render={(ipsAsArray: string[]) => {
              return ipsAsArray.map((ip, idx) =>
                this.renderIP(ip.replace('/64', ''), idx)
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
