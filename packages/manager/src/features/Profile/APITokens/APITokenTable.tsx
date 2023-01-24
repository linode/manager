import {
  createPersonalAccessToken,
  deleteAppToken,
  deletePersonalAccessToken,
  Token,
} from '@linode/api-v4/lib/profile';
import { APIError } from '@linode/api-v4/lib/types';
import { DateTime } from 'luxon';
import * as React from 'react';
import ActionsPanel from 'src/components/ActionsPanel';
import AddNewLink from 'src/components/AddNewLink';
import Button from 'src/components/Button';
import ConfirmationDialog from 'src/components/ConfirmationDialog';
import { makeStyles, Theme } from 'src/components/core/styles';
import TableBody from 'src/components/core/TableBody';
import TableHead from 'src/components/core/TableHead';
import Typography from 'src/components/core/Typography';
import DateTimeDisplay from 'src/components/DateTimeDisplay';
import Grid from 'src/components/Grid';
import PaginationFooter from 'src/components/PaginationFooter';
import Table from 'src/components/Table';
import TableCell from 'src/components/TableCell';
import TableRow from 'src/components/TableRow';
import TableRowEmptyState from 'src/components/TableRowEmptyState';
import TableRowError from 'src/components/TableRowError';
import { TableRowLoading } from 'src/components/TableRowLoading/TableRowLoading';
import TableSortCell from 'src/components/TableSortCell';
import SecretTokenDialog from 'src/features/Profile/SecretTokenDialog';
import { useOrder } from 'src/hooks/useOrder';
import { usePagination } from 'src/hooks/usePagination';
import {
  useAppTokensQuery,
  usePersonalAccessTokensQuery,
} from 'src/queries/profile';
import isPast from 'src/utilities/isPast';
import { APITokenDrawer, DrawerMode, genExpiryTups } from './APITokenDrawer';
import APITokenMenu from './APITokenMenu';
import { basePermNameMap, basePerms } from './utils';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    background: theme.color.white,
    width: '100%',
  },
  headline: {
    marginLeft: 7,
  },
  tokens: {
    marginBottom: theme.spacing(2),
  },
  addNewWrapper: {
    '&.MuiGrid-item': {
      padding: 5,
    },
  },
  labelCell: {
    ...theme.applyTableHeaderStyles,
    width: '40%',
    [theme.breakpoints.down('lg')]: {
      width: '25%',
    },
  },
}));

export type APITokenType = 'OAuth Client Token' | 'Personal Access Token';
export type APITokenTitle =
  | 'Third Party Access Tokens'
  | 'Personal Access Tokens';

interface Props {
  type: APITokenType;
  title: APITokenTitle;
}

interface FormState {
  mode: DrawerMode;
  open: boolean;
  errors?: APIError[];
  id?: number;
  values: {
    scopes?: string;
    expiry?: string;
    label: string;
  };
}

interface DialogState {
  open: boolean;
  id?: number;
  label?: string;
  errors?: APIError[];
  type: string;
  submittingDialog: boolean;
}

interface TokenState {
  open: boolean;
  value?: string;
}

const preferenceKey = 'api-tokens';

export const APITokenTable = (props: Props) => {
  const classes = useStyles();
  const { type, title } = props;

  const { order, orderBy, handleOrderChange } = useOrder(
    {
      orderBy: 'expiry',
      order: 'desc',
    },
    `${preferenceKey}-order}`,
    type === 'OAuth Client Token' ? 'oauth' : 'token'
  );
  const pagination = usePagination(1, preferenceKey);

  const queryMap = {
    'OAuth Client Token': useAppTokensQuery,
    'Personal Access Token': usePersonalAccessTokensQuery,
  };

  const useTokenQuery = queryMap[type];

  const { data, isLoading, error } = useTokenQuery(
    {
      page: pagination.page,
      page_size: pagination.pageSize,
    },
    { '+order': order, '+order_by': orderBy }
  );

  const [form, setForm] = React.useState<FormState>({
    mode: 'view',
    open: false,
    errors: undefined,
    id: undefined,
    values: {
      scopes: '*',
      expiry: genExpiryTups()[3][1],
      label: '',
    },
  });

  const [dialog, setDialog] = React.useState<DialogState>({
    open: false,
    id: 0,
    label: undefined,
    errors: undefined,
    type: '',
    submittingDialog: false,
  });

  const [token, setToken] = React.useState<TokenState>({
    open: false,
    value: undefined,
  });

  const openCreateDrawer = () => {
    setForm({
      mode: 'create',
      open: true,
      id: undefined,
      values: {
        label: '',
        expiry: genExpiryTups()[0][1],
        scopes: '*',
      },
    });
  };

  const openViewDrawer = (token: Token) => {
    setForm({
      mode: 'view',
      open: true,
      id: token.id,
      values: {
        scopes: token.scopes,
        expiry: token.expiry ?? '',
        label: token.label,
      },
    });
  };

  const openEditDrawer = (token: Token) => {
    setForm({
      mode: 'edit',
      open: true,
      id: token.id,
      values: {
        scopes: token.scopes,
        expiry: token.expiry ?? '',
        label: token.label,
      },
    });
  };

  const closeDrawer = () => {
    /* Only set { open: false } to avoid flicker of drawer appearance while closing */
    setForm((prev) => ({
      ...prev,
      open: false,
    }));
  };

  const openRevokeDialog = (token: Token, type: string) => {
    const { label, id } = token;
    setDialog((prev) => ({
      ...prev,
      open: true,
      label,
      id,
      type,
      errors: undefined,
    }));
  };

  const closeRevokeDialog = () => {
    setDialog((prev) => ({
      ...prev,
      id: undefined,
      open: false,
      submittingDialog: false,
    }));
  };

  const openTokenDialog = (token: string) => {
    setDialog((prev) => ({
      ...prev,
      errors: undefined,
    }));

    setForm((prev) => ({
      ...prev,
      errors: undefined,
    }));

    setToken({
      open: true,
      value: token,
    });
  };

  const closeTokenDialog = () => {
    setToken({ open: false, value: undefined });
  };

  const revokePersonalAccessToken = () => {
    deletePersonalAccessToken(dialog.id ?? -1).then(() => closeRevokeDialog());
  };

  const revokeAppToken = () => {
    deleteAppToken(dialog.id ?? -1).then(() => {
      closeRevokeDialog();
    });
  };

  const handleDrawerChange = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, values: { ...form.values, [key]: value } }));
  };

  const createToken = (scopes: string) => {
    createPersonalAccessToken({ ...form.values, scopes }).then(({ token }) => {
      closeDrawer();
      openTokenDialog(token ?? '');
    });
  };

  const editToken = () => {
    // updatePersonalAccessToken(id, { label }).then(() => {
    //   closeDrawer();
    // });
  };

  const renderContent = () => {
    if (isLoading) {
      return <TableRowLoading columns={4} />;
    }

    if (error) {
      return <TableRowError colSpan={4} message={error[0].reason} />;
    }

    return data?.results === 0 ? (
      <TableRowEmptyState colSpan={6} />
    ) : (
      renderRows(data?.data ?? [])
    );
  };

  const renderRows = (tokens: Token[]) => {
    return tokens.map((token: Token) => (
      <TableRow
        ariaLabel={token.label}
        key={token.id}
        data-qa-table-row={token.label}
      >
        <TableCell data-qa-token-label>{token.label}</TableCell>
        <TableCell>
          <Typography variant="body1" data-qa-token-created>
            <DateTimeDisplay value={token.created} />
          </Typography>
        </TableCell>
        <TableCell>
          <Typography variant="body1" data-qa-token-expiry>
            {
              /*
             The expiry time of tokens that never expire are returned from the API as
             200 years in the future, so we just need to check that they're at least
             100 years into the future to safely assume they never expire.

             The expiry time of apps that don't expire until revoked come back as 'null'.
             In this case, we display an expiry time of "never" as well.
             */
              token.expiry === null || isWayInTheFuture(token.expiry) ? (
                'never'
              ) : (
                <DateTimeDisplay value={token.expiry} />
              )
            }
          </Typography>
        </TableCell>
        <TableCell actionCell>
          <APITokenMenu
            token={token}
            type={type}
            isThirdPartyAccessToken={title === 'Third Party Access Tokens'}
            openViewDrawer={openViewDrawer}
            openEditDrawer={openEditDrawer}
            openRevokeDialog={openRevokeDialog}
          />
        </TableCell>
      </TableRow>
    ));
  };

  const revokeAction = () => {
    return dialog.type === 'OAuth Client Token'
      ? revokeAppToken()
      : revokePersonalAccessToken();
  };

  const renderRevokeConfirmationActions = () => {
    return (
      <ActionsPanel>
        <Button
          buttonType="secondary"
          onClick={closeRevokeDialog}
          data-qa-button-cancel
        >
          Cancel
        </Button>
        <Button
          buttonType="primary"
          onClick={revokeAction}
          data-qa-button-confirm
        >
          Revoke
        </Button>
      </ActionsPanel>
    );
  };

  return (
    <React.Fragment>
      <Grid
        className={`${classes.root} m0`}
        container
        alignItems="center"
        justifyContent="space-between"
      >
        <Grid item>
          <Typography
            variant="h3"
            className={classes.headline}
            data-qa-table={type}
          >
            {title}
          </Typography>
        </Grid>
        <Grid item className={classes.addNewWrapper}>
          {type === 'Personal Access Token' && (
            <AddNewLink
              onClick={openCreateDrawer}
              label="Create a Personal Access Token"
            />
          )}
        </Grid>
      </Grid>
      <div className={classes.tokens}>
        <Table aria-label="List of Personal Access Tokens">
          <TableHead>
            <TableRow data-qa-table-head>
              <TableSortCell
                className={classes.labelCell}
                active={orderBy === 'label'}
                label="label"
                direction={order}
                handleClick={handleOrderChange}
              >
                Label
              </TableSortCell>
              <TableSortCell
                active={orderBy === 'created'}
                label="created"
                direction={order}
                handleClick={handleOrderChange}
              >
                Created
              </TableSortCell>
              <TableSortCell
                active={orderBy === 'expiry'}
                label="expiry"
                direction={order}
                handleClick={handleOrderChange}
              >
                Expires
              </TableSortCell>
              <TableCell />
            </TableRow>
          </TableHead>
          <TableBody>{renderContent()}</TableBody>
        </Table>
      </div>
      <PaginationFooter
        page={pagination.page}
        pageSize={pagination.pageSize}
        count={data?.results ?? 0}
        handlePageChange={pagination.handlePageChange}
        handleSizeChange={pagination.handlePageSizeChange}
        eventCategory="api tokens table"
      />

      <APITokenDrawer
        open={form.open}
        mode={form.mode}
        errors={form.errors}
        id={form.id}
        label={form.values.label}
        scopes={form.values.scopes}
        expiry={form.values.expiry}
        perms={basePerms}
        permNameMap={basePermNameMap}
        closeDrawer={closeDrawer}
        onChange={handleDrawerChange}
        onCreate={createToken}
        onEdit={editToken}
      />

      <ConfirmationDialog
        title={`Revoking ${dialog.label}`}
        open={dialog.open}
        actions={renderRevokeConfirmationActions}
        onClose={closeRevokeDialog}
      >
        <Typography>Are you sure you want to revoke this API Token?</Typography>
      </ConfirmationDialog>

      <SecretTokenDialog
        title="Personal Access Token"
        open={token.open}
        onClose={closeTokenDialog}
        value={token.value}
      />
    </React.Fragment>
  );
};

/**
 * return true if the given time is past 100 year in the future
 */
export const isWayInTheFuture = (time: string) => {
  const wayInTheFuture = DateTime.local().plus({ years: 100 }).toISO();
  return isPast(wayInTheFuture)(time);
};

export default APITokenTable;
