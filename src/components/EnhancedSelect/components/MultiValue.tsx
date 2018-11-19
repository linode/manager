import * as React from 'react';
import { MultiValueProps } from 'react-select/lib/components/MultiValue';
import Chip from 'src/components/core/Chip';
import { StyleRulesCallback, withStyles, WithStyles } from 'src/components/core/styles';

type ClassNames = 'root';

const styles: StyleRulesCallback<ClassNames> = (theme) => ({
  root: {
    margin: '2px',
  },
});

interface Props extends MultiValueProps<any> { }

type CombinedProps = Props & WithStyles<ClassNames>;

class MultiValue extends React.PureComponent<CombinedProps> {
  onDelete = (event: React.SyntheticEvent<HTMLElement>) => {
    const { removeProps: { onClick, onMouseDown } } = this.props;
    onClick(event);
    onMouseDown(event);
  }

  render() {
    const { classes, children } = this.props;

    return (
        <Chip
          data-qa-multi-option={children}
          className={classes.root}
          tabIndex={-1}
          label={children}
          onDelete={this.onDelete}
        />
    );
  }
}

const styled = withStyles(styles);

export default styled(MultiValue);
