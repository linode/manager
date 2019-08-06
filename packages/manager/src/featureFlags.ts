// These flags should correspond with active features flags in LD
interface Flags {
  managed: boolean;
  buttonColor: string;
  objectStorage: boolean;
  vatBanner: string[];
}

/**
 * If the LD client hasn't been initialized, `flags`
 * (from withFeatureFlagConsumer or useFlags) will be an empty object.
 */
export type FlagSet = Partial<Flags>;
