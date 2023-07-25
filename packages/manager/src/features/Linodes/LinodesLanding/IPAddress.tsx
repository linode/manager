import { Theme } from '@mui/material/styles';
import { WithStyles, createStyles, withStyles } from '@mui/styles';
import copy from 'copy-to-clipboard';
import { tail } from 'ramda';
import * as React from 'react';

import { CopyTooltip } from 'src/components/CopyTooltip/CopyTooltip';
import { ShowMore } from 'src/components/ShowMore/ShowMore';
import { privateIPRegex } from 'src/utilities/ipUtils';

type CSSClasses =
  | 'hide'
  | 'icon'
  | 'ipLink'
  | 'multipleAddresses'
  | 'right'
  | 'root'
  | 'row';

const styles = (theme: Theme) =>
  createStyles({
    hide: {
      '&:focus': {
        opacity: 1,
      },
      [theme.breakpoints.up('md')]: {
        // Hide until the component is hovered,
        // when props.showCopyOnHover is true (only on desktop)
        opacity: 0,
      },
      transition: theme.transitions.create(['opacity']),
    },
    icon: {
      '& svg': {
        height: 12,
        top: 1,
        width: 12,
      },
    },
    ipLink: {
      color: theme.palette.primary.main,
      display: 'inline-block',
      position: 'relative',
      top: -1,
      transition: theme.transitions.create(['color']),
    },
    multipleAddresses: {
      '&:not(:last-child)': {
        marginBottom: theme.spacing(0.5),
      },
    },
    right: {
      alignItems: 'center',
      display: 'flex',
      justifyContent: 'center',
      marginLeft: theme.spacing(0.5),
    },
    root: {
      '&:hover': {
        '& $hide': {
          opacity: 1,
        },
      },
      '&:last-child': {
        marginBottom: 0,
      },
      marginBottom: theme.spacing(0.5),
      maxWidth: '100%',
      width: '100%',
    },
    row: {
      alignItems: 'flex-start',
      display: 'flex',
      width: '100%',
    },
  });

interface Props {
  ips: string[];
  showAll?: boolean;
  showCopyOnHover?: boolean;
  showMore?: boolean;
}

export const sortIPAddress = (ip1: string, ip2: string) =>
  (privateIPRegex.test(ip1) ? 1 : -1) - (privateIPRegex.test(ip2) ? 1 : -1);

export class IPAddress extends React.Component<Props & WithStyles<CSSClasses>> {
  componentWillUnmount() {
    if (this.copiedTimeout !== null) {
      window.clearTimeout(this.copiedTimeout);
    }
  }

  render() {
    const { classes, ips, showAll, showMore } = this.props;

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
            render={(ipsAsArray: string[]) => {
              return ipsAsArray.map((ip, idx) =>
                this.renderIP(ip.replace('/64', ''), idx)
              );
            }}
            ariaItemType="IP addresses"
            data-qa-ip-more
            items={tail(formattedIPS)}
          />
        )}
      </div>
    );
  }

  clickIcon = (ip: string) => {
    this.setState({
      copied: true,
    });
    window.setTimeout(() => this.setState({ copied: false }), 1500);
    copy(ip);
  };

  copiedTimeout: null | number = null;

  renderCopyIcon = (ip: string) => {
    const { classes, showCopyOnHover } = this.props;

    return (
      <div className={`${classes.ipLink}`} data-qa-copy-ip>
        <CopyTooltip
          className={`${classes.icon} ${showCopyOnHover ? classes.hide : ''}
            ${classes.right} copy`}
          text={ip}
        />
      </div>
    );
  };

  renderIP = (ip: string, key?: number) => {
    const { classes, showAll } = this.props;
    return (
      <div
        className={`${classes.row} ${showAll && classes.multipleAddresses}`}
        key={key}
      >
        <CopyTooltip copyableText data-qa-copy-ip-text text={ip} />
        {this.renderCopyIcon(ip)}
      </div>
    );
  };

  state = {
    copied: false,
  };
}

export default withStyles(styles)(IPAddress);
