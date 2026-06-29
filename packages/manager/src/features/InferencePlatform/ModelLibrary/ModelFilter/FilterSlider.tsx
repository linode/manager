import Slider from '@mui/material/Slider';
import React, { useEffect, useState } from 'react';

import type { SliderProps } from '@mui/material/Slider';

interface FilterSliderProps {
  marks: { label: string; value: number }[];
  max: number;
  min: number;
  onChange: SliderProps['onChange'];
  scale: (value: number) => number;
  type: 'context' | 'parameters';
  value: [number, number];
}

export const FilterSlider = ({
  type,
  marks,
  max,
  min,
  onChange,
  scale,
  value,
}: FilterSliderProps) => {
  const [hue, setModehue] = useState<string>('210)');

  useEffect(() => {
    if (type === 'parameters') {
      setModehue('220');
    } else {
      setModehue('200');
    }
  }, [type]);

  return (
    <Slider
      disableSwap
      marks={marks}
      max={max}
      min={min}
      onChange={onChange}
      scale={scale}
      size="small"
      step={1}
      sx={(theme) => ({
        display: 'block',
        mb: 0.6,
        '& .MuiSlider-thumb': {
          height: 20,
          width: 20,
          border:
            theme.palette.mode === 'light'
              ? `2px solid hsl(${hue}, 100%, 95%)`
              : `2px solid hsl(${hue}, 100%, 80%)`,
          backgroundColor:
            theme.palette.mode === 'light'
              ? `hsl(${hue}, 60%, 60%)`
              : `hsl(${hue}, 60%, 50%)`,
          boxShadow:
            '2px 2px 5px hsla(230, 30%, 20%, 0.5), 0 0 12px hsla(230, 30%, 30%, 0.4)',
          '&:focus, &:hover': {
            backgroundColor:
              theme.palette.mode === 'light'
                ? `hsl(${hue}, 60%, 55%)`
                : `hsl(${hue}, 60%, 45%)`,
          },
          '&.Mui-active': {
            backgroundColor:
              theme.palette.mode === 'light'
                ? `hsl(${hue}, 100%, 40%)`
                : `hsl(${hue}, 100%, 41%)`,
            borderColor: `hsl(${hue}, 100%, 90%)`,
          },
        },
        '& .MuiSlider-track': {
          backgroundColor:
            theme.palette.mode === 'light'
              ? `hsl(${hue}, 70%, 75%)`
              : `hsl(${hue}, 50%, 40%)`,
          height: 5,
        },
        '& .MuiSlider-rail': {
          backgroundColor:
            theme.palette.mode === 'light'
              ? `hsl(${hue}, 60%, 30%)`
              : `hsl(${hue}, 60%, 15%)`,
          opacity: theme.palette.mode === 'light' ? 0.4 : 0.3,
          height: 2.5,
        },
        '& .MuiSlider-mark': {
          bgcolor:
            theme.palette.mode === 'light'
              ? `hsl(${hue}, 50%, 50%)`
              : `hsl(${hue}, 50%, 90%)`,
          height: 7,
          opacity: theme.palette.mode === 'light' ? 0.95 : 0.4,
          transform: 'translateX(-2px) translateY(-1px)',
          width: 2,
          marginTop: -0.3,
        },
        '& .MuiSlider-markActive': {
          bgcolor:
            theme.palette.mode === 'light'
              ? `hsl(${hue}, 100%, 99%)`
              : `hsl(${hue}, 100%, 98%)`,
          opacity: theme.palette.mode === 'light' ? 0.7 : 0.3,
        },
        '& .MuiSlider-markLabel': {
          color:
            theme.palette.mode === 'light'
              ? `hsl(${hue}, 50%, 50%)`
              : `hsl(${hue}, 70%, 75%)`,
          font: `${theme.font.semibold}`,
          fontSize: 12,
          top: 29,
        },
      })}
      value={value}
    />
  );
};
