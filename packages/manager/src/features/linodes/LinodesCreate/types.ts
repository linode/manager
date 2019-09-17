import { Image } from 'linode-js-sdk/lib/images';
import { CreateLinodeRequest, Linode } from 'linode-js-sdk/lib/linodes';
import { ExtendedRegion } from 'src/components/EnhancedSelect/variants/RegionSelect';
import { Tag } from 'src/components/TagsInput';
import { State as userSSHKeysProps } from 'src/features/linodes/userSSHKeyHoc';
import { ExtendedType } from './SelectPlanPanel';

export interface ExtendedLinode extends Linode {
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

/**
 * These props are meant purely for what is displayed in the
 * Checkout bar
 */
export interface WithDisplayData {
  typeDisplayInfo?: TypeInfo;
  regionDisplayInfo?: Info;
  imageDisplayInfo?: Info;
  backupsMonthlyPrice?: number | null;
}

/**
 * Redux Props including the error and loading states.
 * These props are meant for the parent component that is doing
 * the null, loading and error checking
 */
export interface WithImagesProps {
  imagesData?: Record<string, Image>;
  imagesLoading: boolean;
  imagesError?: string;
}

export interface WithLinodesProps {
  linodesData?: Linode[];
  linodesLoading: boolean;
  linodesError?: Linode.ApiFieldError[];
}

export interface WithRegionsProps {
  regionsData?: ExtendedRegion[];
  regionsLoading: boolean;
  regionsError?: Linode.ApiFieldError[];
}

export interface WithTypesProps {
  typesData?: ExtendedType[];
  typesLoading: boolean;
  typesError?: Linode.ApiFieldError[];
}

/**
 * Pure Data without the loading and error
 * keys. Component with these props have already been
 * safe-guarded with null, loading, and error checking
 */
export interface WithTypesRegionsAndImages {
  regionsData: ExtendedRegion[];
  typesData: ExtendedType[];
  imagesData: Record<string, Image>;
}

export interface WithLinodesTypesRegionsAndImages
  extends WithTypesRegionsAndImages {
  linodesData: Linode[];
}

export interface ReduxStateProps {
  accountBackupsEnabled: boolean;
  userCannotCreateLinode: boolean;
}

export type HandleSubmit = (
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
  resetSSHKeys: () => void;
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
  availableStackScriptImages?: Image[];
  updateStackScript: (
    id: number,
    label: string,
    username: string,
    userDefinedFields: Linode.StackScript.UserDefinedField[],
    availableImages: Image[],
    defaultData?: any
  ) => void;
  selectedUDFs?: any;
  handleSelectUDFs: (stackScripts: any[]) => void;
}

/**
 * additional form fields needed when create a Linode from a backup
 * Note that it extends the _Clone_ props because creating from a backup
 * requires the Linodes data
 */
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

/**
 * Additional props that don't have a logic place to live under but still
 * need to be passed down to the children
 */
export type ReduxStatePropsAndSSHKeys = ReduxStateProps & userSSHKeysProps;
