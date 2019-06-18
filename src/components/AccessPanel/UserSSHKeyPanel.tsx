import * as React from 'react';
import CheckBox from 'src/components/CheckBox';
import TableBody from 'src/components/core/TableBody';
import TableHead from 'src/components/core/TableHead';
import TableRow from 'src/components/core/TableRow';
import Table from 'src/components/Table';
import TableCell from 'src/components/TableCell';
import TableHeader from 'src/components/TableHeader';

type ClassNames =
  | 'root'
  | 'cellCheckbox'
  | 'cellUser'
  | 'userWrapper'
  | 'gravatar';

import {
  createStyles,
  Theme,
  withStyles,
  WithStyles
} from 'src/components/core/styles';

const styles = (theme: Theme) =>
  createStyles({
    root: {},
    cellCheckbox: {
      width: 50,
      paddingLeft: theme.spacing(1),
      paddingRight: theme.spacing(1)
    },
    cellUser: {
      width: '30%'
    },
    userWrapper: {
      display: 'inline-flex',
      alignItems: 'center',
      marginTop: theme.spacing(1) / 2
    },
    gravatar: {
      borderRadius: '50%',
      marginRight: theme.spacing(1)
    }
  });

export interface UserSSHKeyObject {
  gravatarUrl: string;
  username: string;
  selected: boolean;
  keys: string[];
  onSSHKeyChange: (
    e: React.ChangeEvent<HTMLInputElement>,
    result: boolean
  ) => void;
}

interface Props {
  users: UserSSHKeyObject[];
}

type CombinedProps = Props & WithStyles<ClassNames>;

const UserSSHKeyPanel: React.FunctionComponent<CombinedProps> = props => {
  const { classes, users } = props;

  return (
    <React.Fragment>
      <TableHeader title="SSH Keys" />
      <Table isResponsive={false} border spacingBottom={16}>
        <TableHead>
          <TableRow>
            <TableCell className={classes.cellCheckbox} />
            <TableCell className={classes.cellUser} data-qa-table-header="User">
              User
            </TableCell>
            <TableCell data-qa-table-header="SSH Keys">SSH Keys</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {users.map(
            ({ gravatarUrl, keys, onSSHKeyChange, selected, username }) => (
              <TableRow key={username} data-qa-ssh-public-key>
                <TableCell className={classes.cellCheckbox}>
                  <CheckBox checked={selected} onChange={onSSHKeyChange} />
                </TableCell>
                <TableCell className={classes.cellUser}>
                  <div className={classes.userWrapper}>
                    <img
                      src={gravatarUrl}
                      className={classes.gravatar}
                      alt={username}
                    />
                    {username}
                  </div>
                </TableCell>
                <TableCell>{keys.join(', ')}</TableCell>
              </TableRow>
            )
          )}
        </TableBody>
      </Table>
    </React.Fragment>
  );
};

const styled = withStyles(styles);

export default styled(UserSSHKeyPanel);
