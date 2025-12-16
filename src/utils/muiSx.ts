import { SxProps, Theme } from '@mui/material/styles';

type SXInput = undefined | null | SxProps<Theme> | ((theme: Theme) => SxProps<Theme>) | SXInput[];

/**
 * muiSx - flexible sx merging helper for MUI v7
 */
export function muiSx(...inputs: SXInput[]): SxProps<Theme> {
  const result: Exclude<SXInput, SXInput[]>[] = [];

  const flatten = (item: SXInput) => {
    if (!item) return;

    if (Array.isArray(item)) {
      item.forEach(flatten);
      return;
    }

    result.push(item);
  };

  inputs.forEach(flatten);

  // ⬇️ IMPORTANT: cast array to SxProps<Theme> so MUI accepts it
  return result as SxProps<Theme>;
}
