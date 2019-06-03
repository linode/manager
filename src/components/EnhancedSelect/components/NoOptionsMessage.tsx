import * as React from 'react';
import { NoticeProps } from 'react-select/lib/components/Menu';
import {
  createStyles,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';

type ClassNames = 'root';

const styles = (theme: Theme) =>
  createStyles({
  root: {}
});

interface Props extends NoticeProps<any> {}

type CombinedProps = Props & WithStyles<ClassNames>;

const NoOptionsMessage: React.StatelessComponent<CombinedProps> = props => {
  const { selectProps, innerProps, children } = props;

  return (
    <Typography
      className={selectProps.classes.noOptionsMessage}
      {...innerProps}
      data-qa-no-options
    >
      {children}
    </Typography>
  );
};

const styled = withStyles(styles);

export default styled(NoOptionsMessage);
