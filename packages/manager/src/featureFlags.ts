// These flags should correspond with active features flags in LD

export interface Link {
  link: string;
  text_to_replace: string;
  type: 'internal' | 'external';
}

interface VATBanner {
  links: Record<string, Link>;
  preference_key: string;
  text: string;
}

interface Flags {
  managed: boolean;
  objectStorage: boolean;
  promos: boolean;
  vatBanner: VATBanner;
}

/**
 * If the LD client hasn't been initialized, `flags`
 * (from withFeatureFlagConsumer or useFlags) will be an empty object.
 */
export type FlagSet = Partial<Flags>;
