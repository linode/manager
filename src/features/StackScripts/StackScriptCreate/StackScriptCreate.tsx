import * as React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';

import { compose, pathOr } from 'ramda';

import {
  StyleRulesCallback,
  Theme,
  withStyles,
  WithStyles,
} from '@material-ui/core/styles';

import FormControl from '@material-ui/core/FormControl';
// import FormHelperText from '@material-ui/core/FormHelperText';
import IconButton from '@material-ui/core/IconButton';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import { KeyboardArrowLeft } from '@material-ui/icons';

import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import Checkbox from 'src/components/CheckBox';
import Grid from 'src/components/Grid';
import HelpIcon from 'src/components/HelpIcon';
import Notice from 'src/components/Notice';
import PromiseLoader from 'src/components/PromiseLoader';
import Select from 'src/components/Select';
import Tag from 'src/components/Tag';
import TextField from 'src/components/TextField';

import { getLinodeImages } from 'src/services/images';

type ClassNames = 'root'
  | 'backButton'
  | 'titleWrapper'
  | 'createTitle'
  | 'adornment';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme & Linode.Theme) => ({
  root: {
    padding: theme.spacing.unit * 2,
  },
  backButton: {
    margin: '5px 0 0 -16px',
    '& svg': {
      width: 34,
      height: 34,
    },
  },
  createTitle: {
    lineHeight: '2.25em'
  },
  titleWrapper: {
    display: 'flex',
    marginTop: 5,
  },
  adornment: {
    fontSize: '.9rem',
    marginLeft: 5,
    color: theme.color.grey1
  },
});

interface Props { 
  profile: Linode.Profile;
}

interface PreloadedProps {
  images: { response: Linode.Image[] }
}

interface State {
  labelText: string;
  descriptionText: string;
  imageSelectOpen: boolean;
  selectedImages: string[];
  availableImages: Linode.Image[];
  script: string;
  revisionNote: string;
  is_public: boolean;
 }

type CombinedProps = Props
  & WithStyles<ClassNames>
  & PreloadedProps;

const preloaded = PromiseLoader<Props>({
  images: () => getLinodeImages()
    .then(response => response.data || [])
})

export class StackScriptCreate extends React.Component<CombinedProps, State> {
  state: State = {
    labelText: '',
    descriptionText: '',
    imageSelectOpen: false,
    selectedImages: [],
    /* available images to select from in the dropdown */
    availableImages: this.props.images.response,
    script: '',
    revisionNote: '',
    is_public: false,
  };

  handleLabelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({labelText: e.target.value});
  }

  handleDescriptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ descriptionText: e.target.value });
  }

  handleOpenSelect = () => {
    this.setState({ imageSelectOpen: true });
  }

  handleCloseSelect = () => {
    this.setState({ imageSelectOpen: false });
  }

  handleRemoveImage = (indexToRemove: any) => {
    const selectedImagesCopy = this.state.selectedImages;
    selectedImagesCopy.splice(indexToRemove, 1);
    this.setState({ selectedImages: selectedImagesCopy });
  }

  handleChooseImage = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { availableImages } = this.state;
    const filteredAvailableImages = availableImages.filter((image) => {
      return image.label !== e.target.value;
    })
    this.setState({
      selectedImages: [...this.state.selectedImages, e.target.value],
      availableImages: filteredAvailableImages,
    })
    this.setState({ imageSelectOpen: true });
  }

  handleChangeScript = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ script: e.target.value });
  }

  handleChangeRevisionNote = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ revisionNote: e.target.value });
  }

  handleToggleIsPublic = () => {
    this.setState({ is_public: !this.state.is_public });
  }

  resetAllFields = () => {
    this.setState({
      script: '',
      labelText: '',
      selectedImages: [],
      descriptionText: '',
      is_public: false,
      revisionNote: '',
    })
  }

  renderNoticeHTML = () => {
    return (
      `<h3>Woah, just a word of caution...</h3>
        <p>Making this StackScript public cannot be undone. Once made public, your StackScript will
          be available to all Linode users and can be used to provision new Linodes.
      </p>`
    )
  }

  render() {
    const { classes, profile } = this.props;
    const { availableImages, selectedImages, script,
    labelText, descriptionText, revisionNote } = this.state;

    const payload = {
      script: this.state.script,
      label: this.state.labelText,
      images: this.state.selectedImages,
      description: this.state.descriptionText,
      is_public: this.state.is_public,
      rev_note: this.state.revisionNote,
    }

    console.log(payload);

    return (
      <React.Fragment>
        <Grid
          container
          justify="space-between"
        >
          <Grid item className={classes.titleWrapper}>
            <Link to={`/stackscripts`}>
              <IconButton
                className={classes.backButton}
              >
                <KeyboardArrowLeft />
              </IconButton>
            </Link>
            <Typography className={classes.createTitle} variant="headline">
              Create New StackScript
      </Typography>
          </Grid>
        </Grid>
        <Paper className={classes.root}>
          <TextField
            InputProps={{
              startAdornment: <span className={classes.adornment}>
                {profile.username} /</span>,
            }}
            // errorText={hasErrorFor('client_conn_throttle')}
            label='StackScript Label'
            required
            onChange={this.handleLabelChange}
            placeholder='Enter a label'
            value={labelText}
          />
          <HelpIcon text="Select a StackScript Label" />
          <TextField
            multiline
            rows={1}
            label="Description"
            placeholder="Enter a description"
            onChange={this.handleDescriptionChange}
            value={descriptionText}
          // errorText={hasErrorFor('ssl_cert')}
          // errorGroup={forEdit ? `${configIdx}`: undefined}
          />
          <HelpIcon text="Give your StackScript a description" />
          <FormControl fullWidth>
            <InputLabel
              htmlFor="image"
              disableAnimation
              shrink={true}
              required
            // error={Boolean(regionError)}
            >
              Target Images
          </InputLabel>
            <Select
              open={this.state.imageSelectOpen}
              onOpen={this.handleOpenSelect}
              onClose={this.handleCloseSelect}
              value='none'
              onChange={this.handleChooseImage}
              inputProps={{ name: 'image', id: 'image' }}
            // error={Boolean(regionError)}
            >
              <MenuItem disabled key="none" value="none">Select Compatible Images</MenuItem>,
            {availableImages && availableImages.map(image =>
                <MenuItem
                  key={image.id}
                  value={image.label}
                >
                  {image.label}
              </MenuItem>,
              )}
            </Select>
          </FormControl>
          <HelpIcon text="Select Multiple Images" />
          {selectedImages && selectedImages.map((selectedImage, index) => {
            return (
              <Tag
                key={selectedImage}
                label={selectedImage}
                variant='lightBlue'
                onDelete={() => this.handleRemoveImage(index)}
              />
            )
          })}
          <TextField
            multiline
            rows={1}
            label="Script"
            placeholder={`#!/bin/bash \n\n# Your script goes here`}
            onChange={this.handleChangeScript}
            value={script}
            required
          // errorText={hasErrorFor('ssl_cert')}
          // errorGroup={forEdit ? `${configIdx}`: undefined}
          />
          <TextField
            multiline
            rows={1}
            label="Revision Note"
            placeholder='Enter a revision note'
            onChange={this.handleChangeRevisionNote}
            value={revisionNote}
          // errorText={hasErrorFor('ssl_cert')}
          // errorGroup={forEdit ? `${configIdx}`: undefined}
          />
          <Notice warning flag html={this.renderNoticeHTML()} />
          <InputLabel
            htmlFor="make_public"
            disableAnimation
            shrink={true}
          // error={Boolean(regionError)}
          >
            <Checkbox
              name='make_public'
              variant='warning'
              onChange={this.handleToggleIsPublic}
              checked={this.state.is_public}
            />
            Publish this StackScript to the Public Library
          </InputLabel>
          <ActionsPanel style={{ padding: 0 }}>
            <Button
              data-qa-confirm-cancel
              onClick={() => console.log('saved')}
              type="primary"
              loading={false}
            >
              Save
            </Button>
            <Button
              onClick={this.resetAllFields}
              type="secondary"
              className="cancel"
              data-qa-cancel-cancel
            >
              Cancel
            </Button>
          </ActionsPanel>
        </Paper>
      </React.Fragment>
    );
  }
}

const mapStateToProps = (state: Linode.AppState) => ({
  profile: pathOr({}, ['resources', 'profile', 'data'], state),
});

const styled = withStyles(styles, { withTheme: true });

export default compose(
  styled,
  connect(mapStateToProps),
  preloaded
)(StackScriptCreate)
