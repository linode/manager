import { path } from 'ramda';
import * as React from 'react';
import { Link, RouteComponentProps, withRouter } from 'react-router-dom';
import { compose } from 'recompose';
import {
  createStyles,
  Theme,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import Notice from 'src/components/Notice';
import { EU_COUNTRIES } from 'src/constants';
import AccountContainer, {
  DispatchProps
} from 'src/containers/account.container';
import localStorageContainer from 'src/containers/localStorage.container';

type ClassNames = 'root';

const styles = (theme: Theme) =>
  createStyles({
    root: {
      paddingTop: theme.spacing(3),
      paddingRight: theme.spacing(3),
      paddingLeft: theme.spacing(3)
    }
  });

interface AccountProps {
  country?: string;
  taxId?: string;
  lastUpdated: number;
  accountLoading?: boolean;
  accountError: boolean;
}

type CombinedProps = AccountProps &
  DispatchProps &
  LocalStorageState &
  LocalStorageUpdater &
  RouteComponentProps &
  WithStyles<ClassNames>;

export const shouldShowVatBanner = (
  showBanner: boolean,
  country?: string,
  taxId?: string
) => {
  /**
   * If there's no country data for this user,
   * or the data hasn't loaded yet, we can't determine
   * if the user is in the EU. Don't show the banner.
   */
  if (!country) {
    return false;
  }

  /**
   * If the user has previously dismissed the banner, don't show it
   */
  if (!showBanner) {
    return false;
  }

  /**
   * We want to show the banner to users in the EU who
   * don't already have a tax_id set on their account
   */
  return EU_COUNTRIES.includes(country || '') && !taxId;
};

export const VATBanner: React.FunctionComponent<CombinedProps> = props => {
  React.useEffect(() => {
    if (props.lastUpdated === 0) {
      // If we haven't already requested account data, do it here:
      props.requestAccount();
    }
  }, []);

  const { showVATBanner, hideVATBanner } = props;

  const { accountLoading, accountError, classes, country, taxId } = props;

  if (accountLoading || accountError) {
    return null;
  }

  const message = (
    <div>
      {`Starting 1 June 2019, `}
      <a
        href="https://www.linode.com/docs/platform/billing-and-support/tax-information/#value-added-tax-in-the-european-union"
        target="_blank"
      >
        value added tax
      </a>
      {` may be applied to your Linode services. To ensure proper billing, please confirm the accuracy of your account information `}
      {props.location.pathname.match('/account/billing') ? (
        // Don't link to /account/billing if you're already on account/billing
        `in Update Contact Information below`
      ) : (
        <>
          {`by `}
          <Link to="/account/billing">clicking here</Link>
        </>
      )}
      {`.`}
    </div>
  );

  if (!shouldShowVatBanner(showVATBanner, country, taxId)) {
    return null;
  }

  return (
    <div className={classes.root}>
      <Notice
        important
        warning
        dismissible
        onClose={hideVATBanner}
        text={message}
        spacingBottom={0}
      />
    </div>
  );
};

const styled = withStyles(styles);

const withAccount = AccountContainer(
  (ownProps, accountLoading, lastUpdated, accountError, accountData) => ({
    ...ownProps,
    country: path(['country'], accountData),
    taxId: path(['tax_id'], accountData),
    accountUpdated: lastUpdated,
    accountError: accountError.read
  })
);

interface LocalStorageState {
  showVATBanner: boolean;
}

interface LocalStorageUpdater {
  hideVATBanner: () => Partial<LocalStorageState>;
}

const withLocalStorage = localStorageContainer<
  LocalStorageState,
  LocalStorageUpdater,
  {}
>(
  storage => {
    return {
      showVATBanner: storage.notifications.VAT.get() === 'show'
    };
  },
  storage => ({
    hideVATBanner: state => () => {
      storage.notifications.VAT.set('hide');

      return {
        ...state,
        showVATBanner: false
      };
    }
  })
);

interface LocalStorageState {
  showVATBanner: boolean;
}

interface LocalStorageUpdater {
  hideVATBanner: () => Partial<LocalStorageState>;
}

const enhanced = compose<CombinedProps, {}>(
  React.memo,
  styled,
  withAccount,
  withLocalStorage,
  withRouter
);

export default enhanced(VATBanner);
