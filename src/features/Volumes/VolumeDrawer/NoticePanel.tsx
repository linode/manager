import { WithStyles } from '@material-ui/core/styles';
import * as React from 'react';
import { createStyles, Theme, withStyles } from 'src/components/core/styles';
import Notice from 'src/components/Notice';

type ClassNames = 'root';

const styles = (theme: Theme) =>
  createStyles({
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
