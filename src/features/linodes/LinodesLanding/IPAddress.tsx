import * as React from 'react';
import {
  withStyles,
  Theme,
  WithStyles,
  StyleRulesCallback,
} from 'material-ui/styles';
import Typography from 'material-ui/Typography';
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
| 'ip';

const styles: StyleRulesCallback<CSSClasses> = (theme: Theme & Linode.Theme) => ({
  root: {
    alignItems: 'center',
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
    height: '0.8125rem',
    width: '0.8125rem',
    cursor: 'pointer',
    color: LinodeTheme.palette.primary.main,
  },
  ip: {
    fontSize: 14,
  },
});

interface Props {
  ips: string[];
  copyRight?: boolean;
}

class IPAddress extends React.Component<Props & WithStyles<CSSClasses> > {
  renderCopyIcon = (ip: string) => {
    const { classes, copyRight } = this.props;

    return <ContentCopyIcon
      className={`${classes.icon} ${copyRight ? classes.right : classes.left}`}
      onClick={() => copy(ip)}
    />;
  }

  renderIP = (ip: string, copyRight?: Boolean, key?: number) => {
    const { classes } = this.props;
    return (
      <div key={key} className={classes.row}>
        <Typography className={classes.ip}>
          {ip}
        </Typography>
        {!copyRight && this.renderCopyIcon(ip)}
        {copyRight && this.renderCopyIcon(ip)}
      </div>
    );
  }

  render() {
    const { classes, ips, copyRight } = this.props;

    return (
      <div className={`dif ${classes.root}`}>
        { this.renderIP(ips[0], copyRight) }
        {
          ips.length > 1 && <ShowMore
            items={tail(ips)}
            render={(ips: string[]) => {
              return ips.map((ip, idx) => this.renderIP(ip, copyRight, idx));
            }} />
        }
      </div>
    );
  }
}

export default withStyles(styles, { withTheme: true })(IPAddress);
