import { StyleRulesCallback, withStyles, WithStyles } from '@material-ui/core/styles';
import * as React from 'react';
import { components as reactSelectComponents } from 'react-select';
import { MultiValueGenericProps } from 'react-select/lib/components/MultiValue';

type ClassNames = 'root';

const styles: StyleRulesCallback<ClassNames> = (theme) => ({
  root: {
    borderRadius: '4px',
    backgroundColor: 'orange',
  },
});

interface Props extends MultiValueGenericProps<any> {
}

type CombinedProps = Props & WithStyles<ClassNames>;

const MultiValueContainer: React.StatelessComponent<CombinedProps> = (props) => {
  const {
    classes,
    innerProps: { className, ...restInnerProps },
    ...rest
  } = props;

  const updatedProps: MultiValueGenericProps<any> = {
    ...rest,
    innerProps: restInnerProps,
  };

  return (
    <reactSelectComponents.MultiValueContainer {...updatedProps} className={classes.root} />
  );
};

const styled = withStyles(styles);

export default styled(MultiValueContainer);
