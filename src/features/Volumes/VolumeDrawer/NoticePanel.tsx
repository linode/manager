import {
  StyleRulesCallback,
  withStyles,
  WithStyles
} from '@material-ui/styles';
import * as React from 'react';
import Notice from 'src/components/Notice';

type ClassNames = 'root';

const styles: StyleRulesCallback<ClassNames> = theme => ({
  root: {}
});

interface Props {
  success?: string;
  error?: string;
  important?: boolean;
}

type CombinedProps = Props & WithStyles<ClassNames>;

const NoticePanel: React.StatelessComponent<CombinedProps> = ({
  success,
  error,
  important
}) => {
  return (
    <>
      {success && (
        <Notice success important={important}>
          {success}
        </Notice>
      )}

      {error && (
        <Notice error important={important}>
          {error}
        </Notice>
      )}
    </>
  );
};

const styled = withStyles(styles);

export default styled(NoticePanel);
