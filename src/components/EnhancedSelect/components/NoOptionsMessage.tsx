import * as React from 'react';
import { NoticeProps } from 'react-select/lib/components/Menu';

import { StyleRulesCallback, withStyles, WithStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';


type ClassNames = 'root';

const styles: StyleRulesCallback<ClassNames> = (theme) => ({
  root: {},
});

interface Props extends NoticeProps<any> { }

type CombinedProps = Props & WithStyles<ClassNames>;

const NoOptionsMessage: React.StatelessComponent<CombinedProps> = (props) => {
  const { selectProps, innerProps, children } = props;

  return (
    <Typography
      className={selectProps.classes.noOptionsMessage}
      {...innerProps}
    >
      {children}
    </Typography>
  );
};

const styled = withStyles(styles, { withTheme: true });

export default styled<Props>(NoOptionsMessage);
