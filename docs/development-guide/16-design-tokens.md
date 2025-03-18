
# Design Tokens
## Token Usage

Our design system provides tokens via the `theme.tokens` object, which contains various token categories like spacing, color, typography, etc. These tokens are the building blocks of our design system and should be used consistently throughout the application.

```tsx
// Accessing spacing tokens directly
theme.tokens.spacing.S16  // "1rem"

// Accessing typography tokens
theme.tokens.alias.Typography.Heading.Xxl  // "800 1.625rem/2rem 'Nunito Sans'"
```

### ⚠️ Warning: Global vs. Theme-Sensitive Tokens

**Do not use `theme.tokens.color` directly in application code.** These are global tokens which are not theme-sensitive and will not respond to theme changes (light/dark mode).

```tsx
// ❌ Incorrect: Using global color tokens directly
<Paper sx={(theme) => ({ backgroundColor: theme.tokens.color.Neutral[5] })}>

// ✅ Correct: Using alias (semantic) color tokens
<Paper sx={(theme) => ({ backgroundColor: theme.tokens.alias.Content.Background.Normal })}>

<Paper sx={(theme) => ({ backgroundColor: theme.semanticTokens.textColors.primary })}>
```

### Best Practices for Token Usage

- Use the most specific token available for your use case.
- Prefer alias or component tokens (which describe purpose) over global tokens (which describe appearance).
- For spacing, use `theme.spacingFunction()` instead of accessing tokens directly when building layouts.

## Spacing

### The spacingFunction

We are transitioning from using MUI's default `theme.spacing` to our own custom `theme.spacingFunction` to ensure consistency with our design token system.

```tsx
// ❌ Deprecated: Using MUI's default spacing
<Box sx={(theme) => ({ padding: theme.spacing(2) })}> // 16px (2 × 8px base unit)

// ✅ Preferred: Using our custom spacingFunction
<Box sx={(theme) => ({ padding: theme.spacingFunction(16) })}> // "1rem" (S16 token = 16px)
```

#### Key Differences

- **Direct Token Mapping**: Values map directly to our design tokens (S4 = 4px, S8 = 8px, etc.)
- **No Multiplication**: Unlike MUI's spacing that multiplies by a base unit (typically 8px), our spacingFunction maps the value directly to the closest token
- **Rounding Behavior**: For values that don't exactly match a token, the function rounds to the nearest available token

#### Examples

```tsx
// Direct token mapping
theme.spacingFunction(4)      // "0.25rem" (S4 token = 4px)
theme.spacingFunction(8)      // "0.5rem"  (S8 token = 8px)
theme.spacingFunction(16)     // "1rem"    (S16 token = 16px)

// Rounding behavior
theme.spacingFunction(3)      // "0.25rem" (S4 token = 4px, closest to 3)
theme.spacingFunction(5)      // "0.25rem" (S4 token = 4px, closest to 5)
theme.spacingFunction(7)      // "0.5rem"  (S8 token = 8px, closest to 7)

// Multiple values (CSS shorthand)
theme.spacingFunction(4, 8)             // "0.25rem 0.5rem"
theme.spacingFunction(4, 8, 16)         // "0.25rem 0.5rem 1rem"
theme.spacingFunction(4, 8, 16, 24)     // "0.25rem 0.5rem 1rem 1.5rem"
```

#### Migration Guide

When migrating from `theme.spacing` to `theme.spacingFunction`, use this mapping as a reference:

| MUI spacing | spacingFunction equivalent |
|-------------|----------------------------|
| `theme.spacing(0.5)` | `theme.spacingFunction(4)` |
| `theme.spacing(1)` | `theme.spacingFunction(8)` |
| `theme.spacing(1.5)` | `theme.spacingFunction(12)` |
| `theme.spacing(2)` | `theme.spacingFunction(16)` |
| `theme.spacing(3)` | `theme.spacingFunction(24)` |
| `theme.spacing(4)` | `theme.spacingFunction(32)` |
| `theme.spacing(5)` | `theme.spacingFunction(40)` |
| `theme.spacing(6)` | `theme.spacingFunction(48)` |
| `theme.spacing(8)` | `theme.spacingFunction(64)` |
| `theme.spacing(9)` | `theme.spacingFunction(72)` |
| `theme.spacing(12)` | `theme.spacingFunction(96)` |

#### Available Tokens

Our spacingFunction works with the following design tokens:

```
S0: "0"
S2: "0.125rem" (2px)
S4: "0.25rem" (4px)
S6: "0.375rem" (6px)
S8: "0.5rem" (8px)
S12: "0.75rem" (12px)
S16: "1rem" (16px)
S20: "1.25rem" (20px)
S24: "1.5rem" (24px)
S28: "1.75rem" (28px)
S32: "2rem" (32px)
S36: "2.25rem" (36px)
S40: "2.5rem" (40px)
S48: "3rem" (48px)
S64: "4rem" (64px)
S72: "4.5rem" (72px)
S96: "6rem" (96px)
```
