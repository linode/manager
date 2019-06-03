import { WithStyles } from '@material-ui/core/styles';
import * as React from 'react';
import LinearProgress, {
  LinearProgressProps
} from 'src/components/core/LinearProgress';
import { createStyles, Theme, withStyles } from 'src/components/core/styles';

type CSSClasses = 'root';

const styles = (theme: Theme) =>
  createStyles({
    root: {}
  });

type CombinedProps = LinearProgressProps & WithStyles<CSSClasses>;

const LinearProgressComponent: React.StatelessComponent<
  CombinedProps
> = props => {
  const variant =
    typeof props.value === 'number' ? 'determinate' : 'indeterminate';
  const value = typeof props.value === 'number' ? props.value : 0;
  return (
    <div className={props.classes.root}>
      <LinearProgress
        {...props}
        value={value}
        variant={variant}
        data-qa-linear-progress
      />
    </div>
  );
};

const styled = withStyles(styles);

export default styled(LinearProgressComponent);
