import { Avatar, Box, BoxProps, CSSProperties, Typography } from '@mui/material';
import React from 'react';
import { muiSx } from 'utils/muiSx';

type Props = BoxProps & {
    fileId?: string; // e.g. "1AbCDefGhIJKlmNopQRsTuvWxYz..."
    fileUrl?: string; // e.g. "https://drive.google.com/file/d/1CbH9cK8LHuQEHy6mKKYIrq7mqdlcFvhi/view?usp=sharing"
    firstName?: string;
    alt?: string;
    width?: number | string;
};

const style: CSSProperties = {
    width: '60px',
    height: '60px',
    borderRadius: '100%',
    backgroundColor: 'primary.main',
    overflow: 'hidden',
};

export function extractDriveFileId(input: string): string | null {
    // 1) /file/d/<id>/
    const m1 = input.match(/\/file\/d\/([^/]+)/);
    if (m1?.[1]) return m1[1];

    // 2) ?id=<id>
    const m2 = input.match(/[?&]id=([^&]+)/);
    if (m2?.[1]) return decodeURIComponent(m2[1]);

    // 3) fallback: if user already pasted raw id
    if (/^[a-zA-Z0-9_-]{10,}$/.test(input)) return input;

    return null;
}

export default function ProfileImage({ fileUrl, fileId, firstName = '', alt = 'Drive image', ...props }: Props) {
    // Common public render URL (often works for images)
    // https://drive.google.com/file/d/1CbH9cK8LHuQEHy6mKKYIrq7mqdlcFvhi/view?usp=sharing
    // https://lh3.googleusercontent.com/a/ACg8ocK1y98UjB9yWFRumvC19411Uz6LBIgm9NKzJvUsn_8p4UiNUoc=s96-c
    // https://photos.app.goo.gl/DPJjpgr5GCq45BhN7
    // https://photos.google.com/share/AF1QipMhjpH-Oh0wEVib8U3xbhxhD2Gvq7m_vAld9iAS2iPH4Ez_4hZRJtCbNsq89Ofnag?key=eVdpeHA4SWtXTEk2UE5RQWwzMml4SkRkNFFidldR

    const id = fileId || extractDriveFileId(fileUrl || '');

    //
    if (!id) {
        return <Avatar sx={muiSx(style, props.sx)}>{firstName.charAt(0)}</Avatar>;
    }

    return (
        // <Box {...props} sx={muiSx(style, props.sx)}>
        <Avatar sx={muiSx(style, props.sx)}>
            <Box
                component={'img'}
                src={`https://drive.google.com/uc?export=view&id=${encodeURIComponent(id)}`}
                sx={{ objectFit: 'cover', width: '100%', height: '100%', objectPosition: 'center' }}
                loading='lazy'
                alt={alt}
                referrerPolicy='no-referrer'
                onError={(e) => {
                    // fallback: use thumbnail endpoint (may be more reliable in some cases)
                    (e.currentTarget as HTMLImageElement).src = `https://drive.google.com/thumbnail?id=${encodeURIComponent(id)}&sz=w2000`;
                }}
            />
        </Avatar>
        // </Box>
    );
}
