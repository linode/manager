import * as React from 'react';
import {
  withStyles,
  StyleRulesCallback,
  Theme,
  WithStyles,
} from 'material-ui';


type ClassNames = 'root';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme) => ({
  root: {},
});

interface Props {
  userDefinedFields?: Linode.StackScript.UserDefinedField[];
}

type CombinedProps = Props & WithStyles<ClassNames>;

const UserDefinedFieldsPanel: React.StatelessComponent<CombinedProps> = (props) => {
  // will either be pick one (radio button)
  // pick many (checkbox)
  // text
  // password
  return (
    <div>Hello World</div>
  );
};

const styled = withStyles(styles, { withTheme: true });

export default styled<Props>(UserDefinedFieldsPanel);
