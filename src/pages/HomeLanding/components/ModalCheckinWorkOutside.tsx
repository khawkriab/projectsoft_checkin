import { Box, Button, Modal, TextField, Typography } from '@mui/material';
import { OnCheckinType } from './TodayCheckIn';
import { useRef, useState } from 'react';

export function ModalCheckinWorkOutside({
    open,
    isSending,
    onCheckin,
    onClose,
}: {
    open: boolean;
    isSending: boolean;
    onClose: () => void;
    onCheckin: OnCheckinType;
}) {
    const submitButtonRemark = useRef('');
    const [reason, setReason] = useState('');
    //
    const onSubmit = (e: React.ChangeEvent<HTMLFormElement>) => {
        e.preventDefault();
        onCheckin(true, submitButtonRemark.current, undefined, reason);
    };
    //
    return (
        <Modal
            open={open}
            onClose={() => {
                submitButtonRemark.current = '';
                onClose();
            }}
            sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}
        >
            <Box
                sx={{
                    bgcolor: '#fff',
                    borderRadius: '12px',
                    p: '24px 12px 12px',
                    border: '4px solid #878787',
                    width: '100%',
                    maxWidth: { xs: '90vw', lg: '700px' },
                }}
            >
                <Box component={'form'} onSubmit={onSubmit}>
                    <TextField
                        fullWidth
                        required
                        label='ระบุเหตุผล หรือ พื้นที่ที่ลงไปทำงาน'
                        placeholder='ระบุเหตุผล หรือ พื้นที่ที่ลงไปทำงาน'
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                    />
                    <Box>
                        <Typography color='error'>***หมายเหตุ***</Typography>
                        <Typography color='error'>
                            ถ้าลงชื่อ WFH ในวันเข้างานปกติให้แจ้งพี่โอ๊ต หากไม่แจ้งและถูกปฏิเสธจะถือว่าขาด
                        </Typography>
                    </Box>
                    <Box display={'flex'} ml={'auto'} mt={2} justifyContent={'flex-end'} gap={1}>
                        <Button
                            type='submit'
                            variant='contained'
                            color='secondary'
                            sx={{ width: '100%', height: { xs: 'auto' } }}
                            onClick={() => (submitButtonRemark.current = 'WFH')}
                            loading={isSending}
                        >
                            ลงชื่อ WFH
                        </Button>
                        <Button
                            type='submit'
                            variant='contained'
                            color='error'
                            sx={{ width: '100%', height: { xs: 'auto' } }}
                            onClick={() => (submitButtonRemark.current = 'ทำงานนอกสถานที่')}
                            loading={isSending}
                        >
                            ลงชื่อทำงานนอกสถานที่
                        </Button>
                    </Box>
                </Box>
            </Box>
        </Modal>
    );
}
