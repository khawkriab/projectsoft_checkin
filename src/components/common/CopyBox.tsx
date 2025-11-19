// CopyBox.tsx
import React, { useState } from 'react';
import { Box, Tooltip, IconButton, Snackbar } from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';

export default function CopyBox({ text, children }: { text?: string; children?: React.ReactNode }) {
    const [open, setOpen] = useState(false);

    const copy = async () => {
        try {
            await navigator.clipboard.writeText(text || '');
            setOpen(true);
        } catch {
            // fallback similar to previous component if needed
            setOpen(false);
        }
    };

    if (!text) return null;

    return (
        <>
            <Box
                onClick={copy}
                sx={{
                    p: '2px 4px',
                    borderRadius: '2px',
                    border: '1px solid',
                    borderColor: 'divider',
                    position: 'relative',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    color: '#707070',
                }}
                title='Click to copy'
                role='button'
                tabIndex={0}
            >
                <Box sx={{ flex: 1 }}>{children ?? text}</Box>
                <Tooltip title='Copy'>
                    <IconButton
                        aria-label='copy'
                        size='small'
                        onClick={(e) => {
                            e.stopPropagation();
                            copy();
                        }}
                    >
                        <ContentCopyIcon fontSize='small' />
                    </IconButton>
                </Tooltip>
            </Box>

            <Snackbar open={open} autoHideDuration={1400} onClose={() => setOpen(false)} message='Copied!' />
        </>
    );
}
