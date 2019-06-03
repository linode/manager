import HelpOutline from '@material-ui/icons/HelpOutline';
import * as React from 'react';
import IconButton from 'src/components/core/IconButton';
import {
  createStyles,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import Tooltip from 'src/components/core/Tooltip';

interface Props {
  text: string;
  className?: string;
}

type ClassNames = 'root';

const styles = (theme: Theme) =>
  createStyles({
  root: {}
});

type CombinedProps = Props & WithStyles<ClassNames>;

const HelpIcon: React.StatelessComponent<CombinedProps> = props => {
  const { text, className } = props;

  return (
    <React.Fragment>
      <Tooltip
        title={text}
        data-qa-help-tooltip
        enterTouchDelay={0}
        leaveTouchDelay={5000}
      >
        <IconButton className={className} data-qa-help-button>
          <HelpOutline />
        </IconButton>
      </Tooltip>
    </React.Fragment>
  );
};

const styled = withStyles(styles, { withTheme: true });

export default styled(HelpIcon);
