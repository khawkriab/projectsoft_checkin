import { Alert, AlertColor, Slide, Snackbar } from '@mui/material';
import { createContext, useContext, useState } from 'react';

const NotificationCenterContext = createContext<{ openNotify: (color: AlertColor, message: string) => void }>(null!);

function useNotification() {
    return useContext(NotificationCenterContext);
}

function NotificationCenterProvider({ children }: { children: React.ReactNode }) {
    const [alertOptions, setAlertOptions] = useState({
        message: '',
        color: '',
        open: false,
    });
    //

    const setOpen = (color: AlertColor, message: string) => {
        setAlertOptions((prev) => ({
            ...prev,
            message: message,
            color: color,
            open: true,
        }));
    };

    return (
        <NotificationCenterContext.Provider
            value={{
                openNotify: setOpen,
            }}
        >
            {children}
            <Snackbar
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
                slots={{ transition: Slide }}
                open={alertOptions.open}
                autoHideDuration={6000}
                onClose={() =>
                    setAlertOptions((prev) => ({
                        ...prev,
                        message: '',
                        color: '',
                        open: false,
                    }))
                }
            >
                <Alert
                    onClose={() =>
                        setAlertOptions((prev) => ({
                            ...prev,
                            message: '',
                            color: '',
                            open: false,
                        }))
                    }
                    severity={alertOptions.color as AlertColor}
                    variant='filled'
                    sx={{ width: '100%' }}
                >
                    {alertOptions.message}
                </Alert>
            </Snackbar>
        </NotificationCenterContext.Provider>
    );
}

export default NotificationCenterProvider;
export { useNotification };
