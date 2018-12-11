import { InjectedNotistackProps, withSnackbar } from 'notistack';
import { isNil, pathOr } from 'ramda';
import * as React from 'react';
import { compose } from 'recompose';
import AccessPanel, { UserSSHKeyObject } from 'src/components/AccessPanel';
import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';

import Paper from 'src/components/core/Paper';
import { StyleRulesCallback, withStyles, WithStyles } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import { Item } from 'src/components/EnhancedSelect/Select';
import ErrorState from 'src/components/ErrorState';
import SectionErrorBoundary from 'src/components/SectionErrorBoundary';
import { resetEventsPolling } from 'src/events';
import userSSHKeyHoc from 'src/features/linodes/userSSHKeyHoc';
import { getImages } from 'src/services/images';
import { rebuildLinode } from 'src/services/linodes';
import getAPIErrorFor from 'src/utilities/getAPIErrorFor';
import scrollErrorIntoView from 'src/utilities/scrollErrorIntoView';
import { withLinode } from '../context';

import { ImageSelect } from 'src/features/Images';

type ClassNames = 'root'
 | 'title'
 | 'intro'
 | 'imageControl'
 | 'image';

const styles: StyleRulesCallback<ClassNames> = (theme) => ({
  root: {
    padding: theme.spacing.unit * 3,
    paddingBottom: theme.spacing.unit,
  },
  title: {
    marginBottom: theme.spacing.unit * 2,
  },
  intro: {
    marginBottom: theme.spacing.unit * 2,
  },
  imageControl: {
    display: 'flex',
  },
  image: {
    display: 'flex',
    flexWrap: 'wrap',
  },
});

interface Props {
  userSSHKeys: UserSSHKeyObject[];
}

interface ContextProps {
  linodeId: number;
  linodeLabel: string;
}

interface State {
  images: Linode.Image[];
  imagesError?: string;
  errors?: Linode.ApiFieldError[];
  selected?: string;
  password?: string;
}

type CombinedProps =
  & Props
  & ContextProps
  & WithStyles<ClassNames>
  & InjectedNotistackProps;

class LinodeRebuild extends React.Component<CombinedProps, State> {
  state: State = {
    images: [],
  }

  componentDidMount() {
    getImages().then(response => {
      this.setState({ images: response.data });
    })
      .catch(error => {
        this.setState({ imagesError: error }); // @todo check typing
      })
  }

  handleImageSelect = (selectedItem: Item<string> | null) => {
    if (isNil(selectedItem)) {
      this.setState({ selected: undefined });
      return;
    }
    this.setState({ selected: selectedItem!.value });
  }

  onSubmit = () => {
    const { linodeId, enqueueSnackbar } = this.props;
    const { selected, password } = this.state;
    const errors: Linode.ApiFieldError[] = [];

    /** Reset errors */
    this.setState({ errors: undefined });

    if (!selected) {
      errors.push({ field: 'image', reason: 'Image cannot be blank.' });
    }

    if (!password) {
      errors.push({ field: 'password', reason: 'Password cannot be blank.' });
    }

    if (!selected || !password) {
      /** I hate that I have to do it this way, but TS is complaining.  */
      this.setState({ errors }, () => {
        scrollErrorIntoView();
      });
      return;
    }

    rebuildLinode(
      linodeId,
      { image: selected,
        root_pass: password,
        authorized_users: this.props.userSSHKeys.filter(u => u.selected).map((u) => u.username)
      },
    )
      .then((response) => {
        resetEventsPolling();
        this.setState({ errors: undefined, selected: undefined, password: undefined });
        enqueueSnackbar('Linode rebuild started.', {
          variant: 'info'
        });
      })
      .catch((errorResponse) => {
        pathOr(
          [{ reason: 'There was an issue rebuilding your Linode' }],
          ['response', 'data', 'errors'],
          errorResponse
        )
          .forEach((err: Linode.ApiFieldError) => enqueueSnackbar(err.reason, {
            variant: 'error'
          }));
      });
  }

  onPasswordChange = (value: string) => this.setState({ password: value });

  render() {
    const { classes, linodeLabel, userSSHKeys } = this.props;
    const { errors, images, imagesError } = this.state;

    if (imagesError) {
      return (
        <React.Fragment>
          <DocumentTitleSegment segment={`${linodeLabel} - Rebuild`} />
          <ErrorState errorText="There was an error retrieving images information." />
        </React.Fragment>
      );
    }

    const getErrorFor = getAPIErrorFor({}, errors);
    const imageError = getErrorFor('image');
    const passwordError = getErrorFor('password');

    return (
      <React.Fragment>
        <DocumentTitleSegment segment={`${linodeLabel} - Rebuild`} />
        <Paper className={classes.root}>
          <Typography
            role="header"
            variant="h2"
            className={classes.title}
            data-qa-title
          >
            Rebuild
          </Typography>
          <Typography className={classes.intro} data-qa-rebuild-desc>
            If you can't rescue an existing disk, it's time to rebuild your Linode.
            There are a couple of different ways you can do this:
            either restore from a backup or start over with a fresh Linux
            distribution. Rebuilding will destroy all data.
          </Typography>
          <ImageSelect
            images={images}
            imageError={imageError}
            onSelect={this.handleImageSelect}
            selectWidth={3}
          />
          <AccessPanel
            noPadding
            password={this.state.password || ''}
            handleChange={this.onPasswordChange}
            error={passwordError}
            users={userSSHKeys.length > 0 ? userSSHKeys : []}
          />

          <ActionsPanel>
            <Button
              type="secondary"
              className="destructive"
              onClick={this.onSubmit}
              data-qa-rebuild
            >
              Rebuild
            </Button>
          </ActionsPanel>
        </Paper>
      </React.Fragment>
    );
  }
}

const styled = withStyles(styles);

const linodeContext = withLinode((context) => ({
  linodeId: context.data!.id,
  linodeLabel: context.data!.label,
}));

export default compose<CombinedProps, Props>(
  linodeContext,
  SectionErrorBoundary,
  styled,
  userSSHKeyHoc,
  withSnackbar
)(LinodeRebuild);


