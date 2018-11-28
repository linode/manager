import { StyleRulesCallback, withStyles, WithStyles } from '@material-ui/core/styles';
import * as React from 'react';
import { components as reactSelectComponents } from 'react-select';
import { MultiValueGenericProps } from 'react-select/lib/components/MultiValue';

type ClassNames = 'root';

const styles: StyleRulesCallback<ClassNames> = (theme) => ({
  root: {
    borderRadius: '4px',
    backgroundColor: 'red',
  },
});

interface Props extends MultiValueGenericProps<any>{
}

type CombinedProps = Props & WithStyles<ClassNames>;

const MultiValueLabel: React.StatelessComponent<CombinedProps> = (props) => {
  const {
    classes,
    innerProps: { className, ...restInnerProps },
    ...rest
  } = props;

  const updatedProps = {
    ...rest,
    innerProps: restInnerProps,
  };

  return (
    <div data-qa-multi-option={props.children}>
      <reactSelectComponents.MultiValueLabel {...updatedProps} className={classes.root} />
    </div>
  );
};

const styled = withStyles(styles);

export default styled(MultiValueLabel);
