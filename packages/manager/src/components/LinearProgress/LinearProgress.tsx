import * as React from 'react';
import LinearProgress, {
  LinearProgressProps,
} from 'src/components/core/LinearProgress';

type CombinedProps = LinearProgressProps;

export const LinearProgressComponent: React.FC<CombinedProps> = (props) => {
  const value = typeof props.value === 'number' ? props.value : 0;
  const variant =
    typeof props.value === 'number' ? 'determinate' : 'indeterminate';

  return (
    <LinearProgress
      {...props}
      value={value}
      variant={variant}
      data-testid="linear-progress"
      data-qa-linear-progress
    />
  );
};

export default LinearProgressComponent;
