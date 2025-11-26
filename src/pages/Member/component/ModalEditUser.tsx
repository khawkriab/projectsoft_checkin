import {
    Box,
    Button,
    Chip,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    FormControl,
    FormControlLabel,
    FormLabel,
    Grid,
    IconButton,
    MenuItem,
    Radio,
    RadioGroup,
    TextField,
    Typography,
} from '@mui/material';
import { MuiMobileDatePicker } from 'components/common/MuiInput';
import {
    addUsersRegister,
    getAnnualLeaveEntitlement,
    updateAnnualLeaveEntitlement,
    updateUser,
} from 'context/FirebaseProvider/firebaseApi/userApi';
import dayjs from 'dayjs';
import { useEffect, useMemo, useState } from 'react';
import { AnnualLeaveEntitlement, Profile, ProfileStatus } from 'type.global';
import CloseIcon from '@mui/icons-material/Close';
import { useNotification } from 'components/common/NotificationCenter';

function ModalEditUser({ data, onClose }: { data: Profile; onClose?: () => void }) {
    const { openNotify } = useNotification();
    //
    const currentYears = dayjs().year();
    const [isLoading, setIsLoading] = useState(false);
    const [formRegister, setFormRegister] = useState<Profile>(data);
    const [annualLeaveEntitlement, setAnnualLeaveEntitlement] = useState<AnnualLeaveEntitlement[]>([]);
    const [currentEntitlement, setCurrentEntitlement] = useState<AnnualLeaveEntitlement>({
        personal: 0,
        sick: 0,
        vacation: 0,
        years: currentYears,
    });

    //
    const onChangeStatus = async (suid: string, status: ProfileStatus) => {
        if (!suid) return;
        setIsLoading(true);
        await updateUser(suid, { employmentEndDate: dayjs().format('YYYY-MM-DD'), status: status });
        openNotify('success', 'Update success');
        setIsLoading(false);
    };
    const onSubmit = async (e: React.ChangeEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);

        const payload: Profile = {
            suid: '',
            role: formRegister.role,
            name: formRegister.name,
            jobPosition: formRegister.jobPosition,
            email: formRegister.email,
            status: 'APPROVE',
            employmentEndDate: formRegister.employmentEndDate,
            fullName: formRegister.fullName,
            employmentStartDate: formRegister.employmentStartDate,
            phoneNumber: formRegister.phoneNumber,
            employmentType: formRegister.employmentType,
            profileURL: formRegister.profileURL,
            googleUid: formRegister.googleUid,
        };

        if (!data.suid) {
            // create
            const suid = String(dayjs().valueOf());
            await addUsersRegister(suid, {
                ...payload,
                suid: suid,
            });
            await updateAnnualLeaveEntitlement(suid, currentEntitlement.years, {
                personal: currentEntitlement.personal,
                sick: currentEntitlement.sick,
                vacation: currentEntitlement.vacation,
                years: currentEntitlement.years,
            });
        } else {
            await updateUser(formRegister.suid, {
                ...payload,
                suid: formRegister.suid,
            });
            await updateAnnualLeaveEntitlement(formRegister.suid, currentEntitlement.years, {
                personal: currentEntitlement.personal,
                sick: currentEntitlement.sick,
                vacation: currentEntitlement.vacation,
                years: currentEntitlement.years,
            });
        }
        openNotify('success', 'Update success');
        // await getDataCurrentUser();
        setIsLoading(false);
        // setOpen(true);
    };
    const onChangeText = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormRegister((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    useEffect(() => {
        const getEntitlement = async () => {
            if (!data.suid) return;

            const res = await getAnnualLeaveEntitlement(data.suid);
            setAnnualLeaveEntitlement(res.annualLeaveEntitlement);

            const c = res.annualLeaveEntitlement.find((f) => f.id === String(currentYears));

            if (c) {
                setCurrentEntitlement((prev) => ({ ...prev, ...c }));
            }
        };

        getEntitlement();
    }, []);

    return (
        <Dialog open maxWidth={'lg'}>
            <DialogTitle
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                }}
            >
                <Box display={'flex'} gap={2}>
                    <Typography sx={{ fontSize: 'inherit' }}>จัดการผู้ใช้</Typography>
                    <Chip
                        size='small'
                        label={data.status === 'APPROVE' ? 'ใช้งาน' : data.status === 'WAITING' ? 'รอ' : 'ปิดบัญชี'}
                        color={data.status === 'APPROVE' ? 'success' : data.status === 'WAITING' ? 'warning' : 'error'}
                    />
                </Box>
                <IconButton size='small' disabled={isLoading} onClick={onClose}>
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            <DialogContent dividers>
                <Box
                    sx={{
                        width: '100%',
                        padding: '1rem 0',
                    }}
                >
                    {/* form */}
                    <Box component={'form'} sx={{ width: '100%' }} onSubmit={onSubmit}>
                        <Typography>ข้อมูลระบบ</Typography>
                        <Grid container rowSpacing={4} columnSpacing={3} marginTop={3} marginBottom={3}>
                            <Grid size={{ xs: 12, md: 6 }}>
                                <TextField
                                    disabled
                                    fullWidth
                                    label='SUID'
                                    variant='outlined'
                                    name='suid'
                                    value={formRegister.suid}
                                    onChange={onChangeText}
                                    slotProps={{
                                        inputLabel: { shrink: true },
                                    }}
                                />
                            </Grid>
                            <Grid size={{ xs: 12, md: 6 }}>
                                <TextField
                                    // disabled
                                    required
                                    fullWidth
                                    label='Google Uid'
                                    variant='outlined'
                                    name='suid'
                                    value={formRegister.googleUid}
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
                                    label='Email'
                                    variant='outlined'
                                    // disabled
                                    name='email'
                                    value={formRegister.email}
                                    onChange={onChangeText}
                                />
                            </Grid>
                            <Grid size={{ xs: 12, md: 6 }}>
                                <TextField
                                    select
                                    fullWidth
                                    required
                                    label='Role'
                                    name='role'
                                    error={!formRegister.role}
                                    value={formRegister.role}
                                    onChange={onChangeText}
                                >
                                    <MenuItem value='ADMIN'>Admin</MenuItem>
                                    <MenuItem value='STAFF'>Staff</MenuItem>
                                    <MenuItem value='USER'>User</MenuItem>
                                    <MenuItem value='ORGANIZATION'>Organization</MenuItem>
                                </TextField>
                            </Grid>
                        </Grid>
                        <Typography>ข้อมูลส่วนตัว</Typography>
                        <Grid container rowSpacing={4} columnSpacing={3} marginTop={3} marginBottom={3}>
                            <Grid size={{ xs: 12, md: 6 }}>
                                <TextField
                                    // required
                                    fullWidth
                                    label='Photo Url'
                                    variant='outlined'
                                    // disabled
                                    name='profileURL'
                                    value={formRegister.profileURL}
                                    onChange={onChangeText}
                                />
                            </Grid>
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
                                    // required
                                    type='tel'
                                    fullWidth
                                    label='Phone Number'
                                    variant='outlined'
                                    name='phoneNumber'
                                    // error={!formRegister.phoneNumber}
                                    value={formRegister.phoneNumber}
                                    onChange={onChangeText}
                                />
                            </Grid>
                        </Grid>
                        <Typography>ข้อมูลบริษัท</Typography>
                        <Grid container rowSpacing={4} columnSpacing={3} marginTop={3} marginBottom={3}>
                            <Grid size={{ xs: 12, md: 6 }}>
                                <TextField
                                    select
                                    fullWidth
                                    required
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
                                    <MenuItem value={'Project Manager'}>Project Manager</MenuItem>
                                    <MenuItem value={'Business Analyst'}>Business Analyst</MenuItem>
                                    <MenuItem value={'System Analyst'}>System Analyst</MenuItem>
                                    <MenuItem value={'Quality Assurance'}>Quality Assurance</MenuItem>
                                    <MenuItem value={'DevOps'}>DevOps</MenuItem>
                                    <MenuItem value={'Tester'}>Tester</MenuItem>
                                    <MenuItem value={'HR'}>HR</MenuItem>
                                    <MenuItem value={'CEO'}>CEO</MenuItem>
                                </TextField>
                            </Grid>
                            <Grid size={{ xs: 12, md: 6 }}>
                                <TextField
                                    select
                                    fullWidth
                                    required
                                    label='Employment Type'
                                    name='employmentType'
                                    error={!formRegister.employmentType}
                                    value={formRegister.employmentType}
                                    onChange={onChangeText}
                                >
                                    <MenuItem value={'Company Employee'}>Company Employee</MenuItem>
                                    <MenuItem value={'Intern'}>Intern</MenuItem>
                                </TextField>
                            </Grid>

                            <Grid size={{ xs: 12, md: 6 }}>
                                <MuiMobileDatePicker
                                    label='วันเริ่มทำงาน'
                                    value={formRegister.employmentStartDate ? dayjs(formRegister.employmentStartDate) : undefined}
                                    // minDate={leaveForm.startDate || undefined}
                                    onAccept={(newValue) => {
                                        if (!newValue) return;
                                        setFormRegister((prev) => ({ ...prev, employmentStartDate: newValue.format('YYYY-MM-DD') }));
                                    }}
                                    slotProps={{
                                        textField: {
                                            required: true,
                                            error: !formRegister.employmentStartDate,
                                        },
                                    }}
                                />
                            </Grid>
                            <Grid size={{ xs: 12, md: 6 }}>
                                <MuiMobileDatePicker
                                    label='วันสิ้นสุดการทำงาน'
                                    value={formRegister.employmentEndDate ? dayjs(formRegister.employmentEndDate) : undefined}
                                    // minDate={leaveForm.startDate || undefined}
                                    onAccept={(newValue) => {
                                        if (!newValue) return;
                                        setFormRegister((prev) => ({ ...prev, employmentEndDate: newValue.format('YYYY-MM-DD') }));
                                    }}
                                    slotProps={{
                                        textField: {
                                            // required: true,
                                            // error: !leaveForm.endDate,
                                        },
                                    }}
                                />
                            </Grid>
                        </Grid>
                        <Typography>สวัสดิการ</Typography>
                        <Grid container rowSpacing={4} columnSpacing={3} marginTop={3} marginBottom={3}>
                            <Grid size={{ xs: 12, md: 12 }}>
                                <Divider textAlign='left'>การลาต่อปี</Divider>
                            </Grid>
                            <Grid size={{ xs: 12, md: 6 }}>
                                <TextField
                                    select
                                    required
                                    fullWidth
                                    label='ปี'
                                    variant='outlined'
                                    // disabled
                                    name='years'
                                    value={currentEntitlement.years}
                                    onChange={(e) => {
                                        setCurrentEntitlement((prev) => ({ ...prev, years: Number(e.target.value) }));

                                        const fn = annualLeaveEntitlement.find((f) => f.id === String(e.target.value));

                                        if (fn) {
                                            setCurrentEntitlement((prev) => ({
                                                ...prev,
                                                personal: fn.personal,
                                                sick: fn.sick,
                                                vacation: fn.vacation,
                                            }));
                                        } else {
                                            setCurrentEntitlement((prev) => ({ ...prev, personal: 0, sick: 0, vacation: 0 }));
                                        }
                                    }}
                                >
                                    {Array.from({ length: 3 }).map((_, i) => (
                                        <MenuItem key={i} value={currentYears + i - 1}>
                                            {currentYears + i - 1}
                                        </MenuItem>
                                    ))}
                                </TextField>
                            </Grid>
                            <Grid size={{ xs: 12, md: 6 }}>
                                <TextField
                                    required
                                    fullWidth
                                    type='tel'
                                    label='จำนวนวันลาพักร้อนต่อปี'
                                    variant='outlined'
                                    // disabled
                                    name='vacation'
                                    value={currentEntitlement.vacation}
                                    error={!currentEntitlement.vacation}
                                    onChange={(e) => setCurrentEntitlement((prev) => ({ ...prev, vacation: Number(e.target.value) }))}
                                />
                            </Grid>
                            <Grid size={{ xs: 12, md: 6 }}>
                                <TextField
                                    required
                                    fullWidth
                                    type='tel'
                                    label='จำนวนวันลากิจต่อปี'
                                    variant='outlined'
                                    // disabled
                                    name='personal'
                                    value={currentEntitlement.personal}
                                    error={!currentEntitlement.personal}
                                    onChange={(e) => setCurrentEntitlement((prev) => ({ ...prev, personal: Number(e.target.value) }))}
                                />
                            </Grid>
                            <Grid size={{ xs: 12, md: 6 }}>
                                <TextField
                                    required
                                    fullWidth
                                    type='tel'
                                    label='จำนวนวันลาป่วยต่อปี'
                                    variant='outlined'
                                    // disabled
                                    name='sick'
                                    value={currentEntitlement.sick}
                                    error={!currentEntitlement.sick}
                                    onChange={(e) => setCurrentEntitlement((prev) => ({ ...prev, sick: Number(e.target.value) }))}
                                />
                            </Grid>
                        </Grid>
                        <DialogActions sx={{ marginTop: 3 }}>
                            {data.suid && (
                                <Button
                                    type='button'
                                    variant='contained'
                                    color='error'
                                    disabled={isLoading}
                                    onClick={() => onChangeStatus(data.suid, 'INACTIVE')}
                                >
                                    ปิดบัญชี
                                </Button>
                            )}
                            {!data.suid ? (
                                <Button type='submit' variant='contained' loading={isLoading}>
                                    Create
                                </Button>
                            ) : (
                                <Button type='submit' variant='contained' loading={isLoading}>
                                    Update
                                </Button>
                            )}
                        </DialogActions>
                    </Box>
                </Box>
            </DialogContent>
        </Dialog>
    );
}

export default ModalEditUser;
