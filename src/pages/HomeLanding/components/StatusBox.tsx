import { Box, Theme, Typography } from '@mui/material';

export function StatusBox({
    label,
    dotColor,
    color,
    bgc,
    showBackground = false,
    showLabel = true,
}: {
    label: string;
    dotColor: string;
    color?: (theme: Theme) => string | string;
    bgc: string;
    showBackground?: boolean;
    showLabel?: boolean;
}) {
    return (
        <Box
            sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
                mt: 0.8,
                bgcolor: showBackground ? bgc : 'transparent',
                padding: '1px 6px',
                borderRadius: '16px',
            }}
        >
            <Box
                sx={(theme) => ({
                    width: 10,
                    height: 10,
                    borderRadius: '50%',
                    bgcolor: dotColor,
                })}
            />
            {showLabel && (
                <Typography
                    sx={(theme) => ({
                        color: color && typeof color === 'function' ? color(theme) : color || theme.palette.secondary.contrastText,
                    })}
                >
                    {label}
                </Typography>
            )}
        </Box>
    );
}
