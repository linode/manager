import React from 'react';

interface FilterIconWithBadgeProps {
  /** badge background color */
  badgeColor?: string;
  className?: string;
  /** number of selected filters */
  count?: number;
  /** maximum number to show before using "max+" */
  max?: number;
  /** show badge even when count is zero */
  showZero?: boolean;
  /** icon pixel size (width & height) */
  size?: number;
  /** badge text color */
  textColor?: string;
}

export const FilterIconWithBadge: React.FC<FilterIconWithBadgeProps> = ({
  count = 0,
  size = 20,
  max = 99,
  showZero = false,
  badgeColor = '#E53935', // red
  textColor = '#ffffff',
  className,
}) => {
  const shouldShow = showZero ? count >= 0 : count > 0;
  if (!shouldShow) {
    // Render icon only
    return (
      <svg
        aria-hidden
        className={className}
        fill="none"
        height={size}
        viewBox="0 0 20 20"
        width={size}
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          clipRule="evenodd"
          d="M1.75441 2.12518C1.89632 1.84362 2.18474 1.66602 2.50004 1.66602H17.5C17.8153 1.66602 18.1038 1.84362 18.2457 2.12518C18.3876 2.40674 18.3588 2.74423 18.1713 2.99769L12.5017 10.6597V17.501C12.5017 17.7904 12.3519 18.0592 12.1057 18.2113C11.8595 18.3634 11.5521 18.3773 11.2933 18.2479L7.95995 16.5812C7.67707 16.4398 7.49838 16.1506 7.49838 15.8343V10.6597L1.82882 2.99769C1.64127 2.74423 1.61249 2.40674 1.75441 2.12518ZM4.15665 3.33602L9.0046 9.88767C9.11097 10.0314 9.16838 10.2055 9.16838 10.3843V15.3183L10.8317 16.15V10.3843C10.8317 10.2055 10.8891 10.0314 10.9955 9.88767L15.8434 3.33602H4.15665Z"
          fill="currentColor"
          fillRule="evenodd"
        />
      </svg>
    );
  }

  const display =
    count > max
      ? `${max}+` // show max+
      : `${count}`;

  // place badge in the icon's 20x20 viewBox
  // tweak cx/cy/r/fontSize so it looks good inside 20x20.
  const len = display.length;
  const cx = 15; // x-center for badge
  const cy = 5.75; // y-center for badge (slightly lower than very top to sit nicely)
  const r = len === 1 ? 5.0 : 5.6; // slightly wider for multi-digit
  const fontSize = len === 1 ? 4 : 3.25;

  return (
    <svg
      aria-label={
        count > 0 ? `${count} filters selected` : 'No filters selected'
      }
      className={className}
      fill="none"
      height={size}
      role="img"
      viewBox="0 0 20 20"
      width={size}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* original icon path */}
      <path
        clipRule="evenodd"
        d="M1.75441 2.12518C1.89632 1.84362 2.18474 1.66602 2.50004 1.66602H17.5C17.8153 1.66602 18.1038 1.84362 18.2457 2.12518C18.3876 2.40674 18.3588 2.74423 18.1713 2.99769L12.5017 10.6597V17.501C12.5017 17.7904 12.3519 18.0592 12.1057 18.2113C11.8595 18.3634 11.5521 18.3773 11.2933 18.2479L7.95995 16.5812C7.67707 16.4398 7.49838 16.1506 7.49838 15.8343V10.6597L1.82882 2.99769C1.64127 2.74423 1.61249 2.40674 1.75441 2.12518ZM4.15665 3.33602L9.0046 9.88767C9.11097 10.0314 9.16838 10.2055 9.16838 10.3843V15.3183L10.8317 16.15V10.3843C10.8317 10.2055 10.8891 10.0314 10.9955 9.88767L15.8434 3.33602H4.15665Z"
        fill="currentColor"
        fillRule="evenodd"
      />

      {/* badge background */}
      <circle cx={cx} cy={cy} fill={badgeColor} r={r} />

      {/* number centered */}
      <text
        dominantBaseline="middle"
        fill={textColor}
        fontSize={fontSize}
        style={{
          fontFamily: 'Inter, Arial, Helvetica, sans-serif',
          userSelect: 'none',
        }}
        textAnchor="middle"
        x={cx}
        y={cy}
      >
        {display}
      </text>
    </svg>
  );
};
