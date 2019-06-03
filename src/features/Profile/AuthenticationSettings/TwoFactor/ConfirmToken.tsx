import { compose } from 'ramda';
import * as React from 'react';
import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import {
  createStyles,
  WithStyles,
  withStyles
} from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import Notice from 'src/components/Notice';
import RenderGuard from 'src/components/RenderGuard';
import TextField from 'src/components/TextField';

type ClassNames = 'root' | 'warning';

const styles = (theme: Theme) =>
  createStyles({
  root: {},
  warning: {
    marginTop: theme.spacing(2),
    marginLeft: '0 !important'
  }
});

interface Props {
  token: string;
  submitting: boolean;
  error?: string;
  twoFactorConfirmed: boolean;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onCancel: () => void;
  onSubmit: () => void;
}

type CombinedProps = Props & WithStyles<ClassNames>;

const ConfirmToken: React.StatelessComponent<CombinedProps> = props => {
  const {
    classes,
    token,
    error,
    handleChange,
    onSubmit,
    submitting,
    twoFactorConfirmed,
    onCancel
  } = props;

  return (
    <React.Fragment>
      <Typography variant="body1" data-qa-copy>
        Please enter the token generated by your TFA app:
      </Typography>
      <TextField
        value={token}
        errorText={error}
        label="Token"
        onChange={handleChange}
        data-qa-confirm-token
      />
      <ActionsPanel>
        <Button
          type="primary"
          onClick={onSubmit}
          loading={submitting}
          data-qa-submit
        >
          Confirm Token
        </Button>
        <Button type="cancel" onClick={onCancel} data-qa-cancel>
          Cancel
        </Button>
        {twoFactorConfirmed && (
          <Notice
            warning
            spacingTop={8}
            className={classes.warning}
            text={
              'Confirming a new key will invalidate codes generated from any previous key.'
            }
          />
        )}
      </ActionsPanel>
    </React.Fragment>
  );
};

const styled = withStyles(styles);

export default compose<any, any, any>(
  styled,
  RenderGuard
)(ConfirmToken);
