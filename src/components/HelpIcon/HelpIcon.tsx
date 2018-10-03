import * as React from 'react';

import IconButton from '@material-ui/core/IconButton';
import { StyleRulesCallback, withStyles, WithStyles } from '@material-ui/core/styles';
import Tooltip from '@material-ui/core/Tooltip';
import HelpOutline from '@material-ui/icons/HelpOutline';

interface Props {
  text: string;
  className?: string;
}

interface State {
  open: boolean;
  anchorEl?: HTMLElement;
  anchorReference: string;
}

type ClassNames = 'root';

const styles: StyleRulesCallback<ClassNames> = (theme) => ({
  root: {},
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

  handleOpen = (e: React.MouseEvent<HTMLElement>) => {
    this.setState({
      open: true,
      anchorEl: e.currentTarget,
    });
  }

  render() {
    const { text, className } = this.props;
    return (
      <React.Fragment>
        <Tooltip
          title={text}
          data-qa-help-tooltip
          enterTouchDelay={0}
          leaveTouchDelay={5000}
        >
          <IconButton
            className={className}
            data-qa-help-button
          >
            <HelpOutline />
          </IconButton>
        </Tooltip>
      </React.Fragment>
    );
  }
}

export default styled(HelpIcon);
