import * as React from 'react';

import {
  StyleRulesCallback,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import Notice from 'src/components/Notice';

type ClassNames = 'root';

const styles: StyleRulesCallback<ClassNames> = theme => ({
  root: {}
});

interface Props {
  fileName: string;
  reason: string;
}

type CombinedProps = Props & WithStyles<ClassNames>;

const getText = (fileName: string, reason: string) => {
  return `Error attaching ${fileName}: ${reason}`;
};

const AttachmentError: React.StatelessComponent<CombinedProps> = props => {
  const { fileName, reason } = props;
  return <Notice error text={getText(fileName, reason)} />;
};

const styled = withStyles(styles);

export default styled(AttachmentError);
