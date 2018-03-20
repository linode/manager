import * as React from 'react';
import {
  withStyles,
  WithStyles,
  StyleRulesCallback,
  Theme,
} from 'material-ui';
import IconButton from 'material-ui/IconButton';
import Typography from 'material-ui/Typography';
import Popover from 'material-ui/Popover';
import HelpOutline from 'material-ui-icons/HelpOutline';

interface Props {
  text: string;
}

interface State {
  open: boolean;
  anchorEl?: HTMLElement;
  anchorReference: string;
}

type ClassNames = 'typography';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme) => ({
  typography: {
    padding: theme.spacing.unit,
  },
});

const styled = withStyles(styles, { withTheme: true });

type CombinedProps = Props & WithStyles<ClassNames>;

class HelpIcon extends React.Component<CombinedProps, State> {
  state = {
    open: false,
    anchorEl: undefined,
    anchorReference: 'anchorEl',
  };

  constructor(props: CombinedProps) {
    super(props);
  }

  button = null;

  handleClose = () => {
    this.setState({
      open: false,
    });
  }

  handleClickButton = (e: React.MouseEvent<HTMLElement>) => {
    this.setState({
      open: true,
      anchorEl: e.currentTarget,
    });
  }

  render() {
    const { classes, text } = this.props;
    return (
      <React.Fragment>
        <IconButton onClick={this.handleClickButton}>
          <HelpOutline />
        </IconButton>
        <Popover
          open={this.state.open}
          anchorEl={this.state.anchorEl}
          onClose={this.handleClose}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <Typography className={classes.typography}>{ text }</Typography>
        </Popover>
      </React.Fragment>
    );
  }
}

export default styled(HelpIcon);
