type FeatureFlag = 'vatBanner'; // ... more to come

// We could use the built-in LDFlagSet, but a custom type ensures we're looking for our own flags.
export type FlagSet = Record<FeatureFlag, any>;

/** Functions to determine if the flag is enabled, what the value is, etc. */
interface FlagUtilities {
  isEnabled: (flags: FlagSet) => boolean;
  // ... more to come for other (non-boolean) types of flags
}

export const isVatBannerEnabled = (flags: FlagSet): boolean => {
  return flags.vatBanner === true;
};

const featureFlags: Record<FeatureFlag, FlagUtilities> = {
  vatBanner: {
    isEnabled: isVatBannerEnabled
  }
};

export default featureFlags;
