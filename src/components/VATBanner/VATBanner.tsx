import { path } from 'ramda';
import * as React from 'react';
import { Link } from 'react-router-dom';
import { compose } from 'recompose';
import {
  StyleRulesCallback,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import Notice from 'src/components/Notice';
import { EU_COUNTRIES } from 'src/constants';
import AccountContainer, {
  DispatchProps
} from 'src/containers/account.container';
import { notifications } from 'src/utilities/storage';

type ClassNames = 'root';

const styles: StyleRulesCallback<ClassNames> = theme => ({
  root: {
    paddingTop: theme.spacing.unit * 3,
    paddingRight: theme.spacing.unit * 3,
    paddingLeft: theme.spacing.unit * 3
  }
});

interface AccountProps {
  country?: string;
  taxId?: string;
}

type CombinedProps = AccountProps & DispatchProps & WithStyles<ClassNames>;

const message = (
  <div>
    {`Starting 1 June 2019, VAT may be applied to your Linode services.
    For more information please see `}
    <a
      href="https://www.linode.com/docs/platform/billing-and-support/tax-information/#value-added-tax-in-the-european-union"
      target="_blank"
    >
      Value Added Tax in the European Union
    </a>
    {`. To ensure the correct VAT rate is applied, please verify that your `}
    <Link to="/account/billing">contact information</Link>
    {` is up to date.`}
  </div>
);

export const shouldShowVatBanner = (
  showLocal: boolean,
  showLocalStorage: 'hide' | 'show',
  country?: string,
  taxId?: string
) => {
  if (!country) {
    return false;
  }

  /**
   * If the user has previously dismissed the banner, don't show it
   */
  if (!showLocal || showLocalStorage === 'hide') {
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
    props.requestAccount();
  }, []);

  const [showBanner, setBanner] = React.useState<boolean>(true);

  const hideBanner = () => {
    notifications.VAT.set('hide');
    setBanner(false);
  };

  const { classes, country, taxId } = props;

  const previouslyDismissedBanner = notifications.VAT.get();

  if (
    !shouldShowVatBanner(showBanner, previouslyDismissedBanner, country, taxId)
  ) {
    return null;
  }

  return (
    <div className={classes.root}>
      <Notice
        important
        warning
        dismissible
        onClose={hideBanner}
        text={message}
        spacingBottom={0}
      />
    </div>
  );
};

const styled = withStyles(styles);

const withAccount = AccountContainer(
  (ownProps, accountLoading, accountData) => ({
    ...ownProps,
    country: path(['country'], accountData),
    taxId: path(['tax_id'], accountData)
  })
);

const enhanced = compose<CombinedProps, {}>(
  styled,
  withAccount
);

export default enhanced(VATBanner);
