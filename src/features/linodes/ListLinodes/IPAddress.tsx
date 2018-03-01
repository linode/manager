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

type CSSClasses =  'root' | 'icon';

const styles: StyleRulesCallback<CSSClasses> = (theme: Theme) => ({
  root: {
    alignItems: 'center',
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
}

class IPAddress extends React.Component<Props & WithStyles<CSSClasses> > {
  render(): React.ReactElement<typeof IPAddress> {
    const { classes, ips } = this.props;

    return (
      <div className={`dif ${classes.root}`}>
        <ContentCopyIcon
          className={classes.icon}
          onClick={() => copy(ips[0])}
        />
        <Typography>
          {ips[0]}
        </Typography>
        {ips.length > 1 && 
          <OverflowIPs ips={ips.slice(1)} />
        }
      </div>
    );
  }
}

export default withStyles(styles, { withTheme: true })(IPAddress);
