import { ExtendedRegion } from 'src/components/SelectRegionPanel';
import { Tag } from 'src/components/TagsInput';
import { State as userSSHKeysProps } from 'src/features/linodes/userSSHKeyHoc';
import { CreateLinodeRequest } from 'src/services/linodes';
import { ExtendedType } from './SelectPlanPanel';

export interface ExtendedLinode extends Linode.Linode {
  heading: string;
  subHeadings: string[];
}

export type TypeInfo =
  | {
      title: string;
      details: string;
      monthly: number;
      backupsMonthly: number | null;
    }
  | undefined;

export type Info = { title: string; details?: string } | undefined;

export interface WithDisplayData {
  typeDisplayInfo?: TypeInfo;
  regionDisplayInfo?: Info;
  imageDisplayInfo?: Info;
  backupsMonthlyPrice?: number | null;
}

interface WithImagesProps {
  imagesData: Linode.Image[];
  imagesLoading: boolean;
  imagesError?: string;
}

interface WithLinodesProps {
  linodesData: Linode.Linode[];
  linodesLoading: boolean;
  linodesError?: Linode.ApiFieldError[];
}

interface WithRegions {
  regionsData: ExtendedRegion[];
  regionsLoading: boolean;
  regionsError: Linode.ApiFieldError[];
}

interface WithTypesProps {
  typesData: ExtendedType[];
}

export interface ReduxStateProps {
  accountBackupsEnabled: boolean;
  userCannotCreateLinode: boolean;
}

export type HandleSubmit = (
  type: 'create' | 'clone' | 'createFromStackScript' | 'createFromBackup',
  payload: CreateLinodeRequest,
  linodeID?: number
) => void;

/**
 * minimum number of state and handlers needed for
 * the _create from image_ flow to function
 */
export interface BaseFormStateAndHandlers {
  errors?: Linode.ApiFieldError[];
  formIsSubmitting: boolean;
  handleSubmitForm: HandleSubmit;
  selectedImageID?: string;
  updateImageID: (id: string) => void;
  selectedRegionID?: string;
  updateRegionID: (id: string) => void;
  selectedTypeID?: string;
  updateTypeID: (id: string) => void;
  label: string;
  updateLabel: (
    event: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => void;
  password: string;
  updatePassword: (password: string) => void;
  backupsEnabled: boolean;
  toggleBackupsEnabled: () => void;
  privateIPEnabled: boolean;
  togglePrivateIPEnabled: () => void;
  tags?: Tag[];
  updateTags: (tags: Tag[]) => void;
  resetCreationState: () => void;
}

/**
 * additional form fields needed when creating a Linode from a Linode
 * AKA cloning a Linode
 */
export interface CloneFormStateHandlers extends BaseFormStateAndHandlers {
  selectedDiskSize?: number;
  updateDiskSize: (id: number) => void;
  selectedLinodeID?: number;
  updateLinodeID: (id: number, diskSize?: number) => void;
}

/**
 * additional form fields needed when creating a Linode from a StackScript
 */
export interface StackScriptFormStateHandlers extends BaseFormStateAndHandlers {
  selectedStackScriptID?: number;
  selectedStackScriptUsername?: string;
  selectedStackScriptLabel?: string;
  availableUserDefinedFields?: Linode.StackScript.UserDefinedField[];
  availableStackScriptImages?: Linode.Image[];
  updateStackScript: (
    id: number,
    label: string,
    username: string,
    userDefinedFields: Linode.StackScript.UserDefinedField[],
    availableImages: Linode.Image[],
    defaultData?: any
  ) => void;
  selectedUDFs?: any;
  handleSelectUDFs: (stackScripts: any[]) => void;
}

export interface BackupFormStateHandlers extends CloneFormStateHandlers {
  selectedBackupID?: number;
  setBackupID: (id: number) => void;
}
export interface AppsData {
  appInstances?: Linode.StackScript.Response[];
  appInstancesLoading: boolean;
  appInstancesError?: string;
}

export type AllFormStateAndHandlers = BaseFormStateAndHandlers &
  CloneFormStateHandlers &
  StackScriptFormStateHandlers &
  BackupFormStateHandlers;

export type WithLinodesImagesTypesAndRegions = WithImagesProps &
  WithLinodesProps &
  WithRegions &
  WithTypesProps &
  ReduxStateProps;

export type WithImagesRegionsTypesAndAccountState = WithImagesProps &
  WithRegions &
  WithTypesProps &
  ReduxStateProps;

export type WithAll = WithImagesRegionsTypesAndAccountState & userSSHKeysProps;
