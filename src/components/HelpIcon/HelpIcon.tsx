import * as React from 'react';

import { StyleRulesCallback, withStyles, WithStyles } from '@material-ui/core/styles';

import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';

import { HelpOutline } from '@material-ui/icons';

interface Props {
  text: string;
}

interface State {
  open: boolean;
  anchorEl?: HTMLElement;
  anchorReference: string;
}

type ClassNames = 'root';

const styles: StyleRulesCallback<ClassNames> = (theme: Linode.Theme) => ({
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
    const { text } = this.props;
    return (
      <React.Fragment>
        <Tooltip 
          title={text}
          data-qa-help-tootlip
        > 
          <IconButton data-qa-help-button>
            <HelpOutline />
          </IconButton>
        </Tooltip>
      </React.Fragment>
    );
  }
}

export default styled(HelpIcon);
