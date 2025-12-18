import { Box, BoxProps } from '@mui/material';

export function MenuBox({ children, sx, ...props }: { children: React.ReactNode } & BoxProps) {
    return (
        <Box
            {...props}
            sx={[
                (theme) => ({
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    boxShadow: theme.palette.mode === 'light' ? '0 0 5px 2px #a0a0a03a' : 'none',
                    border: '2px solid #a0a0a03a',
                    borderRadius: '6px',
                    overflow: 'hidden',
                    backgroundColor: theme.palette.background.default,
                    padding: '12px',
                }),
                (theme) => ({ ...(typeof sx === 'function' ? sx(theme) : sx) }),
            ]}
        >
            {children}
        </Box>
    );
}
