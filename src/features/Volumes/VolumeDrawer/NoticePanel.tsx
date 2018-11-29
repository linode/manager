import { StyleRulesCallback, withStyles, WithStyles } from '@material-ui/core/styles';
import * as React from 'react';
import Notice from 'src/components/Notice';

type ClassNames = 'root';

const styles: StyleRulesCallback<ClassNames> = (theme) => ({
  root: {},
});

interface Props {
  success?: string;
  error?: string;
}

type CombinedProps = Props & WithStyles<ClassNames>;

const NoticePanel: React.StatelessComponent<CombinedProps> = ({ success, error }) => {
  return (
    <>
      {success && <Notice success>{success}</Notice>}

      {error && <Notice error>{error}</Notice>}
    </>
  );
};

const styled = withStyles(styles);

export default styled(NoticePanel);
