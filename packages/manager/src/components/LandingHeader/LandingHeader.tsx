import * as React from 'react';

import Grid from 'src/components/Grid';
import Button from 'src/components/Button';
import DocumentationButton from 'src/components/CMR_DocumentationButton';
import EntityHeader, { HeaderProps } from 'src/components/EntityHeader';

interface Props extends Omit<HeaderProps, 'actions'> {
  docsLink: string;
  onAddNew?: () => any;
}

/**
 * This component is essentially a variant of the more abstract EntityHeader
 * component, included as its own component because it will be used in
 * essentially this form across all entity landing pages.
 */

export const LandingHeader: React.FC<Props> = props => {
  const { docsLink, onAddNew, title } = props;

  const actions = React.useMemo(
    () => (
      <Grid container direction="row" alignItems="center" justify="center">
        {onAddNew && (
          <Grid item>
            <Button buttonType="primary" onClick={onAddNew}>
              Create a {title}
            </Button>
          </Grid>
        )}
        {docsLink && <DocumentationButton href={docsLink} />}
      </Grid>
    ),
    [docsLink, title, onAddNew]
  );

  return <EntityHeader actions={actions} {...props} />;
};

export default LandingHeader;
