import * as React from 'react';
import Chip from 'src/components/core/Chip';
import Popover from 'src/components/core/Popover';
import {
  createStyles,
  Theme,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import IPAddress from './IPAddress';

type CSSClasses = 'chip' | 'label' | 'popover';

const styles = (theme: Theme) =>
  createStyles({
    chip: {
      height: theme.typography.body1.fontSize,
      marginLeft: theme.spacing(1) / 2
    },
    label: {
      paddingLeft: theme.spacing(1),
      paddingRight: theme.spacing(1)
    },
    popover: {
      padding: theme.spacing(2)
    }
  });

interface Props {
  ips: string[];
}

class OverflowIPs extends React.Component<Props & WithStyles<CSSClasses>> {
  state = {
    anchorEl: undefined
  };

  handleClick = (event: React.MouseEvent<HTMLElement>) => {
    this.setState({ anchorEl: event.currentTarget });
  };

  handleClose = () => {
    this.setState({ anchorEl: undefined });
  };

  render() {
    const { classes, ips } = this.props;
    const { anchorEl } = this.state;

    return (
      <React.Fragment>
        <Chip
          className={classes.chip}
          label={`+${ips.length}`}
          classes={{ label: classes.label }}
          onClick={this.handleClick}
        />
        <Popover
          classes={{ paper: classes.popover }}
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={this.handleClose}
          anchorOrigin={{
            vertical: 18,
            horizontal: 'left'
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'left'
          }}
        >
          {ips.map(ip => (
            <div key={ip}>
              <IPAddress ips={[ip]} />
            </div>
          ))}
        </Popover>
      </React.Fragment>
    );
  }
}

export default withStyles(styles)(OverflowIPs);
