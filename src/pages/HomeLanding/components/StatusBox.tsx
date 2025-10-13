import { Box, Theme, Typography } from '@mui/material';
import { STATUS, StatusCode } from 'context/UserCalendarProvider';

export function StatusBox({
    color,

    fontSize = '1rem',
    showBackground = false,
    showLabel = true,
    status,
    shape = 'circle',
}: {
    color?: (theme: Theme) => string | string;
    fontSize?: string;
    showBackground?: boolean;
    showLabel?: boolean;
    status: StatusCode;
    shape?: 'circle' | 'triangle';
}) {
    const values = STATUS[status];

    return (
        <Box
            sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
                mt: 0.8,
                bgcolor: showBackground ? values.bgc : 'transparent',
                padding: '1px 6px',
                borderRadius: '16px',
            }}
        >
            {shape === 'circle' && (
                <Box
                    sx={(theme) => ({
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        bgcolor: values.color,
                    })}
                />
            )}
            {shape === 'triangle' && (
                <Box
                    sx={(theme) => ({
                        width: 0,
                        height: 0,
                        borderTop: `10px solid ${values.color}`,
                        borderRight: '10px solid transparent',
                    })}
                />
            )}
            {showLabel && (
                <Typography
                    sx={(theme) => ({
                        fontSize: fontSize,
                        color: color && typeof color === 'function' ? color(theme) : color || theme.palette.secondary.contrastText,
                    })}
                >
                    {values.label}
                </Typography>
            )}
        </Box>
    );
}
