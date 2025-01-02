// =============================================================================
// Config
// =============================================================================
export const queryPresets = {
  longLived: {
    cacheTime: 10 * 60 * 1000,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    staleTime: 5 * 60 * 1000,
  },
  noRetry: {
    retry: false,
  },
  oneTimeFetch: {
    cacheTime: Infinity,
    staleTime: Infinity,
  },
  shortLived: {
    cacheTime: 5 * 60 * 1000,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    staleTime: 0,
  },
};

// =============================================================================
// Utility Functions
// =============================================================================
