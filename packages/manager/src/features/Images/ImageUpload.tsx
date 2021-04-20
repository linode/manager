import { APIError } from '@linode/api-v4/lib/types';
import * as React from 'react';
import { useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';
import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import Paper from 'src/components/core/Paper';
import { makeStyles, Theme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import RegionSelect from 'src/components/EnhancedSelect/variants/RegionSelect';
import TextField from 'src/components/TextField';
import { Dispatch } from 'src/hooks/types';
import { useRegionsQuery } from 'src/queries/regions';
import { uploadImage } from 'src/store/image/image.requests';
import { getErrorMap } from 'src/utilities/errorUtils';
import Notice from 'src/components/Notice';

const useStyles = makeStyles((theme: Theme) => ({
  container: {
    minWidth: '100%',
    padding: theme.spacing(3),
    paddingBottom: theme.spacing(4),
    '& .MuiFormHelperText-root': {
      marginBottom: theme.spacing(2),
    },
  },
  helperText: {
    marginTop: theme.spacing(2),
  },
}));
export interface Props {
  label: string;
  description: string;
  canCreateImage?: boolean;
  changeLabel: (e: React.ChangeEvent<HTMLInputElement>) => void;
  changeDescription: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const ImageUpload: React.FC<Props> = (props) => {
  const {
    canCreateImage,
    label,
    description,
    changeLabel,
    changeDescription,
  } = props;
  const classes = useStyles();
  const { push } = useHistory();
  const [region, setRegion] = React.useState<string>('');
  const dispatch: Dispatch = useDispatch();
  const regions = useRegionsQuery().data ?? [];
  // @todo replace this with React-query
  const [submitting, setSubmitting] = React.useState(false);
  const [errors, setErrors] = React.useState<APIError[] | undefined>();

  const handleSubmit = () => {
    setSubmitting(true);
    setErrors(undefined);
    dispatch(
      uploadImage({
        label,
        description: description || undefined,
        region,
      })
    )
      .then((response) => {
        setSubmitting(false);
        push({
          pathname: '/images',
          state: {
            upload_url: response.upload_to,
          },
        });
      })
      .catch((e) => {
        setSubmitting(false);
        setErrors(e);
      });
  };

  const errorMap = getErrorMap(['label', 'description', 'region'], errors);

  return (
    <Paper className={classes.container}>
      {errorMap.none ? <Notice error text={errorMap.none} /> : null}
      <div style={{ width: '100%' }}>
        <TextField
          label="Label (required)"
          value={label}
          onChange={changeLabel}
          errorText={errorMap.label}
          disabled={!canCreateImage}
        />

        <TextField
          label="Description"
          multiline
          rows={4}
          value={description}
          onChange={changeDescription}
          errorText={errorMap.description}
          disabled={!canCreateImage}
        />

        <RegionSelect
          label={'Region (required)'}
          errorText={errorMap.region}
          handleSelection={setRegion}
          regions={regions}
          selectedID={region}
        />

        <Typography className={classes.helperText}>
          For fastest initial upload, select the region that is geographically
          closest to you. Once uploaded you will be able to deploy the image to
          other regions.
        </Typography>

        <ActionsPanel style={{ marginTop: 16 }}>
          <Button
            onClick={handleSubmit}
            disabled={region === '' || !canCreateImage}
            loading={submitting}
            buttonType="primary"
          >
            Generate URL
          </Button>
        </ActionsPanel>
      </div>
    </Paper>
  );
};

export default ImageUpload;
