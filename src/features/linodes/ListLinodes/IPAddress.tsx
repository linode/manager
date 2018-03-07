import * as React from 'react';
import {
  withStyles,
  Theme,
  WithStyles,
  StyleRulesCallback,
} from 'material-ui/styles';
import Typography from 'material-ui/Typography';
import * as copy from 'copy-to-clipboard';

import OverflowIPs from './OverflowIPs';

import ContentCopyIcon from 'material-ui-icons/ContentCopy';

type CSSClasses =  'root' | 'left' | 'right' | 'icon';

const styles: StyleRulesCallback<CSSClasses> = (theme: Theme & Linode.Theme) => ({
  root: {
    alignItems: 'center',
  },
  left: {
    marginRight: theme.spacing.unit,
  },
  right: {
    marginLeft: theme.spacing.unit,
  },
  icon: {
    marginRight: theme.spacing.unit,
    height: '0.8125rem',
    width: '0.8125rem',
    cursor: 'pointer',
  },
});

interface Props {
  ips: string[];
  copyRight?: boolean;
}

class IPAddress extends React.Component<Props & WithStyles<CSSClasses> > {
  renderCopyIcon() {
    const { classes, ips, copyRight } = this.props;

    return <ContentCopyIcon
      className={`${classes.icon} ${copyRight ? classes.right : classes.left}`}
      onClick={() => copy(ips[0])}
    />;
  }

  render(): React.ReactElement<typeof IPAddress> {
    const { classes, ips, copyRight } = this.props;

    return (
      <div className={`dif ${classes.root}`}>
        {!copyRight && this.renderCopyIcon()}
        <Typography>
          {ips[0]}
        </Typography>
        {copyRight && this.renderCopyIcon()}
        {ips.length > 1 && 
          <OverflowIPs ips={ips.slice(1)} />
        }
      </div>
    );
  }
}

export default withStyles(styles, { withTheme: true })(IPAddress);
