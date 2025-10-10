import { keyframes } from '@emotion/react';
import { CheckCircle } from '@mui/icons-material';
import { IconButton } from '@mui/material';
import { useState } from 'react';

const flip = keyframes`
  0% { transform: rotateY(0deg) scale(0.7); }
  50% { transform: rotateY(360deg) scale(1.2); }
  100% { transform: rotateY(720deg) scale(1); }
`;

export function FlipIcon() {
    const [flipping, setFlipping] = useState(false);

    const handleClick = () => {
        setFlipping(true);
        setTimeout(() => setFlipping(false), 1000);
    };

    return (
        <IconButton
            onClick={handleClick}
            sx={{
                perspective: '1000px',
                '& svg': {
                    animation: `${flip} 1s ease-in-out`,
                },
            }}
        >
            <CheckCircle sx={{ fontSize: '300px' }} color='success' />
        </IconButton>
    );
}
