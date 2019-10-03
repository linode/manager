import Divider, {
  DividerProps as _DividerProps
} from '@material-ui/core/Divider';
import React from 'react'
import { makeStyles, Theme } from 'src/components/core/styles';

const useStyles = makeStyles((theme: Theme) => ({
  line: {
    /** these colors match up with the AppBar component boxShadow colors */
    boxShadow: `inset 0 -1px 0 ${
      theme.name === 'lightTheme' ? theme.color.border2 : theme.color.border3
      }`
  }
}));

const _Divider: React.FC<DividerProps> = (props) => (
  <Divider className={useStyles().line} {...props} />
)

/* tslint:disable-next-line:no-empty-interface */
export interface DividerProps extends _DividerProps { }

export default _Divider;
