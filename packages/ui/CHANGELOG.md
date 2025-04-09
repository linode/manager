## [2025-04-08] - v0.9.0


### Added:

- Move `ListItemOption` from `manager` to `ui` package ([#11790](https://github.com/linode/manager/pull/11790))
- A new `NewFeatureChip` component and updated BetaChip styles ([#11965](https://github.com/linode/manager/pull/11965))
- Chevron Up Icon ([#11946](https://github.com/linode/manager/pull/11946))

### Changed:

- Add `Checkbox` design tokens and update styles to match Akamai Design System ([#11871](https://github.com/linode/manager/pull/11871))

### Fixed:

- BetaChip `color` prop ([#11872](https://github.com/linode/manager/pull/11872))

## [2025-03-25] - v0.8.0


### Added:

- Date Range Picker v2 leveraging Luxon ([#11540](https://github.com/linode/manager/pull/11540))
- New indeterminate state icon for checkbox component ([#11693](https://github.com/linode/manager/pull/11693))
- Time and Timezone selection field to the DatePickerV2 ([#11694](https://github.com/linode/manager/pull/11694))
- Migrate ErrorState to `ui` package ([#11718](https://github.com/linode/manager/pull/11718))
- Migrate Drawer to `ui` package ([#11789](https://github.com/linode/manager/pull/11789))
- Migrate ActionsPanel to `ui` package ([#11810](https://github.com/linode/manager/pull/11810))

### Changed:

- Temporarily extend ESLint rules from `@linode/manager` to `@linode/ui` package ([#11666](https://github.com/linode/manager/pull/11666))
- `Notice`'s default `marginBottom` from `24px` to `8px` ([#11724](https://github.com/linode/manager/pull/11724))
- Move `@vitest/ui` to monorepo root dependency ([#11755](https://github.com/linode/manager/pull/11755))
- Implement Akamai Design System: Apply consistent styling to MuiInputBase, MuiInputAdornment, and MuiAutocomplete components, creating a unified foundation for Autocomplete and TextField elements ([#11807](https://github.com/linode/manager/pull/11807))
- Update body text color to use proper color token ([#11820](https://github.com/linode/manager/pull/11820))

### Tech Stories:

- Upgrade to MUI v6 ([#11688](https://github.com/linode/manager/pull/11688))
- 4.0.0 Design Tokens - New Spacing & Badge Tokens ([#11757](https://github.com/linode/manager/pull/11757))


## [2025-02-25] - v0.7.0


### Added:
- ESLint rules to disallow `data-test-id` attributes and enforce type-safe equality operators ([#11634](https://github.com/linode/manager/pull/11634))
- `Dialog`, `DialogTitle` components, and `visibilityHide.svg`, `visibilityShow.svg`, and `chevron-down.svg` icons to the `@linode/ui` package ([#11673](https://github.com/linode/manager/pull/11673))

### Upcoming Features:

- Add `MuiOutlinedInput` styling in `dark.ts` and `light.ts` ([#11573](https://github.com/linode/manager/pull/11573))

## [2025-01-28] - v0.6.0


### Changed:

- Refactor and clean up `Notice` ([#11480](https://github.com/linode/manager/pull/11480))

### Removed:

- `marketing` variant on `Notice` component ([#11480](https://github.com/linode/manager/pull/11480))

## [2025-01-14] - v0.5.0

### Added:

- New Select component ([#11391](https://github.com/linode/manager/pull/11391))
- New `color="warning"` button style and improved type-safety ([#11469](https://github.com/linode/manager/pull/11469))
- New `MuiButton` variant `loading` along with `color="warning"` styles" ([#11469](https://github.com/linode/manager/pull/11469))

### Changed:

- Update `EditableText` to not use `react-router-dom` and accept a `LinkComponent` prop ([#11333](https://github.com/linode/manager/pull/11333))

### Fixed:

- `sx` prop now properly works being passed down to `Notice` component ([#11469](https://github.com/linode/manager/pull/11469))

## [2024-12-10] - v0.4.0

### Added:

- `Notice` and `Tooltip` components ([#11174](https://github.com/linode/manager/pull/11174))
- `Divider` component ([#11205](https://github.com/linode/manager/pull/11205))
- `CircleProgress` component ([#11214](https://github.com/linode/manager/pull/11214))
- `Stack` component ([#11228](https://github.com/linode/manager/pull/11228))
- `Radio` component ([#11244](https://github.com/linode/manager/pull/11244))
- `Button` component and styled variants ([#11250](https://github.com/linode/manager/pull/11250))
- `RadioGroup` component ([#11254](https://github.com/linode/manager/pull/11254))
- Linter rules for common pr feedback points ([#11258](https://github.com/linode/manager/pull/11258))
- `Chip` component ([#11266](https://github.com/linode/manager/pull/11266))
- `ClickAwayListener` component ([#11267](https://github.com/linode/manager/pull/11267))
- `TooltipIcon` component ([#11269](https://github.com/linode/manager/pull/11269))
- `Checkbox` component ([#11279](https://github.com/linode/manager/pull/11279))
- `H1Header` component ([#11283](https://github.com/linode/manager/pull/11283))
- `TextField` component and `convertToKebabCase` utility function ([#11290](https://github.com/linode/manager/pull/11290))
- `Toggle` component and `ToggleOn` and `ToggleOff` icons ([#11296](https://github.com/linode/manager/pull/11296))
- `Typography` component and story ([#11299](https://github.com/linode/manager/pull/11299))
- `EditableText` component ([#11308](https://github.com/linode/manager/pull/11308))
- `Autocomplete`, `List`, and `ListItem` components ([#11314](https://github.com/linode/manager/pull/11314))
- `Accordion` component ([#11316](https://github.com/linode/manager/pull/11316))
- `FormControlLabel` component ([#11353](https://github.com/linode/manager/pull/11353))

### Tech Stories:

- Update `TextField` component to not depend on `ramda` ([#11306](https://github.com/linode/manager/pull/11306))

## [2024-11-12] - v0.3.0

### Added:

- Tooltip component and story ([#11125](https://github.com/linode/manager/pull/11125))
- IconButton component ([#11158](https://github.com/linode/manager/pull/11158))
- VisibilityIcon component and story ([#11143](https://github.com/linode/manager/pull/11143))
- Migrate `FormControl`, `FormHelperText`, `Input`, `InputAdornment`, and `InputLabel` from `manager` to `ui` package ([#11159](https://github.com/linode/manager/pull/11159))
- `Box` component from `manager` to `ui` package, part 1 ([#11163](https://github.com/linode/manager/pull/11163))
- `Box` component from `manager` to `ui` package, part 2 ([#11164](https://github.com/linode/manager/pull/11164))
- Migrate `Paper` from `manager` to `ui` package ([#11183](https://github.com/linode/manager/pull/11183))

### Tech Stories:

- Remove `@types/node` dependency ([#11157](https://github.com/linode/manager/pull/11157))

### Upcoming Features:

- Add Alias tokens to theme ([#11138](https://github.com/linode/manager/pull/11138))

## [2024-10-28] - v0.2.0

### Added:

- Themes, fonts, and breakpoints previously located in `manager` package ([#11092](https://github.com/linode/manager/pull/11092))

### Changed:

- Move `inputMaxWidth` into `Theme` ([#11116](https://github.com/linode/manager/pull/11116))

## [2024-10-14] - v0.1.0

### Added:

- new `@linode/ui` package with `BetaChip` as the first component ([#11057](https://github.com/linode/manager/pull/11057))
