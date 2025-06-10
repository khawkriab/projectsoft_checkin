import { LeavePeriods, LeaveTypes } from 'type.global';

export const leaveTypes = [
    { label: 'ลาพักร้อน', value: 'VACATION' },
    { label: 'ลาป่วย', value: 'SICK' },
    { label: 'ลากิจ', value: 'PERSONAL' },
];

export const leavePeriods = [
    { label: 'ลาเช้า', value: 'HALF_DAY_AM' },
    { label: 'ลาบ่าย', value: 'HALF_DAY_PM' },
    { label: 'ทั้งวัน', value: 'FULL_DAY' },
];

export const getLeaveType = (value: LeaveTypes) => {
    const findData = leaveTypes.find((f) => f.value === value);

    return findData?.label;
};
export const getLeavePeriod = (value: LeavePeriods) => {
    const findData = leavePeriods.find((f) => f.value === value);

    return findData?.label;
};
