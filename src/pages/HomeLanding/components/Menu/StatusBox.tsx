import { Box, CSSProperties, Theme, Typography } from '@mui/material';
import { STATUS, StatusCode } from 'context/UserCalendarProvider';

export const cornerCurveStyle = (color: string, size: number = 1) => {
    return {
        position: 'absolute',
        top: 0,
        left: 0,
        width: `calc(24px * ${size})`,
        height: `calc(24px * ${size})`,
        overflow: 'hidden',

        '&:before': {
            content: "''",
            display: 'block',
            width: '200%',
            height: '200%',
            position: 'absolute',
            borderRadius: '50%',
            top: 0,
            left: 0,
            boxShadow: `calc(-24px * ${size}) calc(-24px * ${size}) 0 0 ${color}`,
        },
    } as CSSProperties;
};

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
                    sx={() => ({
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        bgcolor: values.color,
                    })}
                />
            )}
            {shape === 'triangle' && <Box sx={[cornerCurveStyle(values.color, 0.7), { position: 'relative' }]} />}
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
