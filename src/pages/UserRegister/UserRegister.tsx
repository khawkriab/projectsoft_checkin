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
import { db, signInWithGoogleGapi } from 'components/common/firebase/firebaseInitialize';
import { useGoogleLogin } from 'components/common/GoogleLoginProvider';
import { addDoc, collection, getDocs, query, where } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { Profile } from 'type.global';

function UserRegister() {
    const { profile, auth2 } = useGoogleLogin();
    //
    const [open, setOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isRegistered, setIsRegistered] = useState(true);
    const [formRegister, setFormRegister] = useState<Profile>({
        email: '',
        fullName: '',
        googleId: '',
        name: '',
        jobPosition: '',
        employmentType: '',
        phoneNumber: '',
        role: 'USER',
    });

    //
    const onSubmit = async (e: React.ChangeEvent<HTMLFormElement>) => {
        e.preventDefault();
        // if (formRegister.sheetRowNumber && auth2 && profile?.token) {
        if (profile?.token) {
            setIsLoading(true);
            await signInWithGoogleGapi(profile.token);
            await addDoc(collection(db, 'usersRegister'), formRegister);
            await getDataCurrentUser();
            // await updateUser(auth2, formRegister, formRegister.sheetRowNumber);
            setIsLoading(false);
            setOpen(true);
        }
    };
    const onChangeText = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent) => {
        setFormRegister((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const getDataCurrentUser = async () => {
        if (profile) {
            const usersRef = collection(db, 'usersRegister');
            const q = query(usersRef, where('googleId', '==', profile.googleId));

            const querySnapshot = await getDocs(q);

            const matchedUsers = querySnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));
            if (matchedUsers.length > 0) {
                setFormRegister((prev) => ({ ...prev, ...matchedUsers[0] }));
            } else {
                // prev data from google account
                setFormRegister((prev) => ({ ...prev, ...profile }));
            }
            setIsRegistered(matchedUsers.length > 0);
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
                                fullWidth
                                label='Full Name'
                                variant='outlined'
                                disabled
                                name='fullName'
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
