import * as React from 'react';
import LinearProgress, {
  LinearProgressProps
} from 'src/components/core/LinearProgress';

type CombinedProps = LinearProgressProps;

const LinearProgressComponent: React.StatelessComponent<
  CombinedProps
> = props => {
  const variant =
    typeof props.value === 'number' ? 'determinate' : 'indeterminate';
  const value = typeof props.value === 'number' ? props.value : 0;
  return (
    <div>
      <LinearProgress
        {...props}
        value={value}
        variant={variant}
        data-qa-linear-progress
      />
    </div>
  );
};

export default LinearProgressComponent;
