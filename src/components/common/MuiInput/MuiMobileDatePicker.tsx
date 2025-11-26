import { LocalizationProvider, MobileDatePicker, MobileDatePickerProps } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { Dayjs } from 'dayjs';
import { useState } from 'react';

function CustomMobileDatePicker(props: MobileDatePickerProps) {
    const [showDialog, setShowDialog] = useState(false);
    const [temp, setTemp] = useState<Dayjs | null>(null);

    //
    return (
        <MobileDatePicker
            {...props}
            value={temp || props?.value}
            onChange={(newValue, c) => {
                // store only temporary selection
                setTemp(newValue);
                props.onChange?.(newValue, c);
            }}
            open={showDialog}
            onOpen={() => setShowDialog(true)}
            onClose={() => setShowDialog(false)}
            format='DD/MM/YYYY'
            sx={{
                '& .MuiPickersOutlinedInput-root.Mui-disabled *': {
                    color: '#000',
                },
            }}
            slotProps={{
                textField: {
                    fullWidth: true,
                    onClick: () => setShowDialog(true),
                    disabled: true,
                    InputLabelProps: {
                        shrink: true,
                    },
                    ...props?.slotProps?.textField,
                },
            }}
        />
    );
}

function MuiMobileDatePicker(props: MobileDatePickerProps) {
    return (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
            <CustomMobileDatePicker {...props} />
        </LocalizationProvider>
    );
}

export default MuiMobileDatePicker;
