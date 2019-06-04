import { WithStyles } from '@material-ui/core/styles';
import KeyboardArrowRight from '@material-ui/icons/KeyboardArrowRight';
import * as React from 'react';
import Button from 'src/components/Button';
import Collapse from 'src/components/core/Collapse';
import { createStyles, Theme, withStyles } from 'src/components/core/styles';

type CSSClasses = 'root' | 'caret';

const styles = (theme: Theme) =>
  createStyles({
    root: {
      paddingLeft: 0,
      paddingRight: 0,
      backgroundColor: 'transparent !important',
      display: 'flex',
      alignItems: 'center',
      fontFamily: theme.font.bold,
      width: 'auto',
      color: theme.color.headline,
      transition: theme.transitions.create('color'),
      '&:hover': {
        color: theme.palette.primary.main,
        '& $caret': {
          color: theme.palette.primary.light
        }
      }
    },
    caret: {
      color: theme.palette.primary.main,
      marginRight: theme.spacing(1) / 2,
      fontSize: 28,
      transition: 'transform .1s ease-in-out',
      '&.rotate': {
        transition: 'transform .3s ease-in-out',
        transform: 'rotate(90deg)'
      }
    }
  });

interface Props {
  name: string;
  defaultExpanded?: boolean;
}

interface State {
  open: boolean | undefined;
}

type CombinedProps = Props & WithStyles<CSSClasses>;

class ShowMoreExpansion extends React.Component<CombinedProps, State> {
  state = { open: this.props.defaultExpanded || false };

  handleNameClick = () => {
    this.setState({
      open: !this.state.open
    });
  };

  componentDidUpdate(prevProps: Props, prevState: State) {
    if (
      prevState.open !== this.props.defaultExpanded &&
      prevProps.defaultExpanded !== this.props.defaultExpanded
    ) {
      this.setState({ open: this.props.defaultExpanded });
    }
  }

  render() {
    const { name, classes, children } = this.props;
    const { open } = this.state;

    return (
      <React.Fragment>
        <Button
          className={classes.root}
          aria-haspopup="true"
          role="button"
          aria-expanded={open ? 'true' : 'false'}
          data-qa-show-more-expanded={open ? 'true' : 'false'}
          onClick={this.handleNameClick}
          data-qa-show-more-toggle
        >
          {open ? (
            <KeyboardArrowRight className={classes.caret + ' rotate'} />
          ) : (
            <KeyboardArrowRight className={classes.caret} />
          )}
          <div>{name}</div>
        </Button>
        <Collapse in={open} className={open ? 'pOpen' : ''}>
          {open ? <div>{children}</div> : null}
        </Collapse>
      </React.Fragment>
    );
  }
}

const styled = withStyles(styles);

export default styled(ShowMoreExpansion);
