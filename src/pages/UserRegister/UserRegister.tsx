import {
    Alert,
    Box,
    Button,
    Divider,
    FormControl,
    FormControlLabel,
    FormLabel,
    Grid,
    InputLabel,
    MenuItem,
    Radio,
    RadioGroup,
    Select,
    SelectChangeEvent,
    Slide,
    Snackbar,
    TextField,
} from '@mui/material';
import { useFirebase } from 'components/common/FirebaseProvider';
import { addUsersRegister, getUsersRegister } from 'components/common/FirebaseProvider/firebaseApi/userApi';
import { useEffect, useState } from 'react';
import { Profile } from 'type.global';

function UserRegister() {
    const { profile } = useFirebase();
    //
    const [open, setOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isRegistered, setIsRegistered] = useState(true);
    const [formRegister, setFormRegister] = useState<Profile>({
        email: '',
        name: '',
        fullName: '',
        googleId: '',
        jobPosition: '',
        profileURL: '',
        employmentType: '',
        phoneNumber: '',
        allowFindLocation: 0,
        role: 'USER',
    });

    //
    const onSubmit = async (e: React.ChangeEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        await addUsersRegister(formRegister);
        await getDataCurrentUser();
        setIsLoading(false);
        setOpen(true);
    };
    const onChangeText = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent) => {
        setFormRegister((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const getDataCurrentUser = async () => {
        if (profile) {
            try {
                const res = await getUsersRegister(profile.email);

                setFormRegister((prev) => ({
                    ...prev,
                    id: res.id,
                    email: res.email,
                    employmentType: res.employmentType,
                    fullName: res.fullName,
                    googleId: res.googleId,
                    jobPosition: res.jobPosition,
                    name: res.name,
                    phoneNumber: res.phoneNumber,
                    profileURL: res.profileURL,
                    role: res.role,
                    status: res.status,
                }));

                if (res.status !== 'NO_REGIST') {
                    setIsRegistered(true);
                }
            } catch (error) {
                console.error('error:', error);
                // prev data from google account
                setFormRegister((prev) => ({
                    ...prev,
                    id: '',
                    email: profile.email,
                    employmentType: profile.employmentType,
                    fullName: profile.fullName,
                    googleId: profile.googleId,
                    jobPosition: profile.jobPosition,
                    name: profile.name,
                    phoneNumber: profile.phoneNumber,
                    profileURL: profile.profileURL ?? '',
                    role: profile.role,
                    status: profile.status,
                }));
                setIsRegistered(false);
            }

            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (profile) {
            getDataCurrentUser();
        }
    }, [JSON.stringify(profile)]);
    //
    return (
        <Box sx={{ width: '100%', maxWidth: '900px', margin: 'auto' }}>
            <Box marginBottom={3}>
                <Divider
                    textAlign='left'
                    sx={(theme) => ({
                        color: theme.palette.text.primary,
                        fontSize: { xs: 20, md: 28 },
                        width: '100%',
                        fontWeight: 700,
                    })}
                >
                    Register
                </Divider>
            </Box>
            {/* panel */}
            <Box
                sx={{
                    width: '100%',
                    border: '1px solid #777',
                    padding: 4,
                    borderRadius: 2,
                }}
            >
                {/* form */}
                <Box component={'form'} sx={{ width: '100%' }} onSubmit={onSubmit}>
                    <Grid container rowSpacing={4} columnSpacing={3}>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <TextField
                                required
                                error={!formRegister.name}
                                fullWidth
                                label='Name'
                                variant='outlined'
                                name='name'
                                value={formRegister.name}
                                onChange={onChangeText}
                                slotProps={{
                                    inputLabel: { shrink: true },
                                }}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <TextField
                                required
                                fullWidth
                                label='Full Name'
                                variant='outlined'
                                // disabled
                                name='fullName'
                                error={!formRegister.fullName}
                                value={formRegister.fullName}
                                onChange={onChangeText}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <TextField
                                fullWidth
                                label='Email'
                                variant='outlined'
                                disabled
                                name='email'
                                value={formRegister.email}
                                onChange={onChangeText}
                            />
                        </Grid>

                        <Grid size={{ xs: 12, md: 6 }}>
                            <TextField
                                required
                                type='tel'
                                fullWidth
                                label='Phone Number'
                                variant='outlined'
                                name='phoneNumber'
                                error={!formRegister.phoneNumber}
                                value={formRegister.phoneNumber}
                                onChange={onChangeText}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <FormControl fullWidth sx={{ flexGrow: 1, minWidth: 120 }}>
                                <InputLabel id='job-position-label'>Job Position</InputLabel>
                                <Select
                                    required
                                    labelId='job-position-label'
                                    id='job-position'
                                    label='Job Position'
                                    name='jobPosition'
                                    error={!formRegister.jobPosition}
                                    value={formRegister.jobPosition}
                                    onChange={onChangeText}
                                >
                                    <MenuItem value={'Front-End'}>Front-End</MenuItem>
                                    <MenuItem value={'Back-End'}>Back-End</MenuItem>
                                    <MenuItem value={'UI Designer'}>UI Designer</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <FormControl error={!formRegister.employmentType} required>
                                <FormLabel>Employment Type</FormLabel>
                                <RadioGroup row name='employmentType' value={formRegister.employmentType} onChange={onChangeText}>
                                    <FormControlLabel value='Company Employee' control={<Radio />} label='Company Employee' />
                                    <FormControlLabel value='Intern' control={<Radio />} label='Intern' />
                                </RadioGroup>
                            </FormControl>
                        </Grid>
                    </Grid>
                    {/* footer */}
                    {!isRegistered && (
                        <Box
                            sx={{
                                width: '100%',
                                textAlign: 'right',
                                marginTop: 6,
                            }}
                        >
                            <Button loading={isLoading} type='submit' variant='contained' color='primary'>
                                Register
                            </Button>
                        </Box>
                    )}
                    {formRegister.id && (
                        <Box
                            sx={{
                                width: '100%',
                                textAlign: 'right',
                                marginTop: 6,
                            }}
                        >
                            <Button loading={isLoading} type='submit' variant='contained' color='primary'>
                                Update
                            </Button>
                        </Box>
                    )}
                </Box>
            </Box>
            <Snackbar
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
                slots={{ transition: Slide }}
                open={open}
                autoHideDuration={6000}
                onClose={() => setOpen(false)}
            >
                <Alert onClose={() => setOpen(false)} severity='success' variant='filled' sx={{ width: '100%' }}>
                    User registered success!
                </Alert>
            </Snackbar>
        </Box>
    );
}

export default UserRegister;
