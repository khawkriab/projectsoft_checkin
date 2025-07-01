import React, { useEffect } from 'react';
import {
    IconButton,
    Popper,
    Paper,
    MenuList,
    MenuItem,
    Avatar,
    Chip,
    Box,
    ClickAwayListener,
    Stack,
    Typography,
    Tooltip,
    Menu,
} from '@mui/material';
import FilterListIcon from '@mui/icons-material/FilterList';
import CloseIcon from '@mui/icons-material/Close';
import { Profile, UserCheckinList } from 'type.global';
import { useFirebase } from '../FirebaseProvider';

interface FilterCheckinUserProps {
    userList: Profile[];
    onChangeFilter: (userList: Profile[]) => void;
}

export default function FilterCheckinUser({ userList, onChangeFilter }: FilterCheckinUserProps) {
    const { profile } = useFirebase();
    const [selectedUsers, setSelectedUsers] = React.useState<Profile[]>([]);
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);

    const handleToggle = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(anchorEl ? null : event.currentTarget);
    };

    const handleSelectUser = (user: Profile) => {
        if (!selectedUsers.find((u) => u.email === user.email)) {
            setSelectedUsers((prev) => [...prev, user]);
        }
    };

    const handleRemoveUser = (userMail: string) => {
        setSelectedUsers((prev) => prev.filter((u) => u.email !== userMail));
    };

    useEffect(() => {
        onChangeFilter(selectedUsers.length > 0 ? selectedUsers : userList);
    }, [JSON.stringify(selectedUsers)]);

    return (
        <Box display={'flex'} alignItems={'center'} flexWrap={'wrap'} gap={1}>
            <Tooltip title='Fillter'>
                <IconButton
                    size='small'
                    sx={(theme) => ({ border: `1px solid ${theme.palette.text.primary}`, color: theme.palette.text.primary })}
                    onClick={handleToggle}
                >
                    <FilterListIcon />
                </IconButton>
            </Tooltip>

            <Stack direction='row' spacing={1}>
                {selectedUsers.length > 0 &&
                    selectedUsers
                        .filter((f) => f.email !== profile?.email)
                        .map((user) => (
                            <Chip
                                key={user.id}
                                avatar={<Avatar src={user.profileURL} />}
                                label={user.name}
                                onDelete={() => handleRemoveUser(user.email)}
                                deleteIcon={<CloseIcon />}
                                variant='outlined'
                                color='info'
                            />
                        ))}
                {profile?.email && (
                    <Chip
                        avatar={<Avatar src={profile.profileURL} />}
                        label={'Me'}
                        variant='outlined'
                        {...(selectedUsers.some((u) => u.email === profile.email)
                            ? {
                                  color: 'info',
                                  onDelete: () => handleRemoveUser(profile.email),
                                  deleteIcon: <CloseIcon />,
                              }
                            : {
                                  color: 'default',
                                  onClick: () => handleSelectUser(profile),
                              })}
                    />
                )}
            </Stack>

            <Menu
                id={'filter-user'}
                open={open}
                anchorEl={anchorEl}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                slotProps={{
                    paper: {
                        elevation: 0,
                        sx: {
                            overflow: 'visible',
                            filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
                            mt: 1.5,
                            '& .MuiAvatar-root': {
                                width: 32,
                                height: 32,
                                ml: -0.5,
                                mr: 1,
                            },
                            '&::before': {
                                content: '""',
                                display: 'block',
                                position: 'absolute',
                                top: 0,
                                right: 14,
                                width: 10,
                                height: 10,
                                bgcolor: 'background.paper',
                                transform: 'translateY(-50%) rotate(45deg)',
                                zIndex: 0,
                            },
                        },
                    },
                }}
            >
                <ClickAwayListener onClickAway={() => setAnchorEl(null)}>
                    <MenuList>
                        {userList.map((user) => {
                            const isSelected = selectedUsers.some((u) => u.id === user.id);
                            return (
                                <MenuItem
                                    key={user.id}
                                    onClick={() => {
                                        if (!isSelected) handleSelectUser(user);
                                    }}
                                    sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', minWidth: '180px' }}
                                >
                                    <Box display='flex' alignItems='center'>
                                        <Avatar src={user.profileURL} sx={{ width: 28, height: 28, mr: 1 }} />
                                        <Typography variant='body2'>{user.name}</Typography>
                                    </Box>

                                    {isSelected && (
                                        <IconButton
                                            size='small'
                                            onClick={(e) => {
                                                e.stopPropagation(); // prevent triggering MenuItem onClick
                                                handleRemoveUser(user.email);
                                            }}
                                        >
                                            <CloseIcon fontSize='small' />
                                        </IconButton>
                                    )}
                                </MenuItem>
                            );
                        })}
                    </MenuList>
                </ClickAwayListener>
            </Menu>
        </Box>
    );
}
