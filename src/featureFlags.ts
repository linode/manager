type FeatureFlag = 'vatBanner'; // ... more to come

// We could use the built-in LDFlagSet, but a custom type ensures we're looking for our own flags.
export type FlagSet = Record<FeatureFlag, any>;
