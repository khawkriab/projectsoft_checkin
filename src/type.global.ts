export type ProfileRole = 'ADMIN' | 'STAFF' | 'USER' | 'ORGANIZATION';
export type ProfileStatus = 'APPROVE' | 'WAITING' | 'NO_REGIST' | 'INACTIVE';
export type LeaveStatus = 'APPROVE' | 'WAITING' | 'REJECT';
export type LeaveTypes = 'VACATION' | 'SICK' | 'PERSONAL';
export type LeavePeriodsType = 'HALF_DAY_AM' | 'HALF_DAY_PM' | 'FULL_DAY';
export type LeavePeriodsLabel = 'ลาเช้า' | 'ลาบ่าย' | 'ทั้งวัน';

export type LatLng = { lat: number; lng: number };

export type StandardResponse<T = any> = T & FirebaseQuery;

export type BaseData = {
    createdAt?: Date | string;
    updatedAt?: Date | string;
};

export type BaseProfile = {
    suid: string;
    name: string;
    googleUid?: string;
    fullName: string;
    profileURL?: string;
    email: string;
    role: ProfileRole;
    status?: ProfileStatus;
};

export type EmployeeInfo = {
    phoneNumber?: string;
    jobPosition?: string;
    employmentType?: string;
    employmentStartDate?: string | null;
    employmentEndDate?: string | null;
};

export type FirebaseQuery = BaseData & {
    id?: string;
};

export type Profile = BaseProfile & EmployeeInfo & FirebaseQuery & BaseData;

export type UserCheckInData = Pick<BaseProfile, 'suid' | 'email' | 'name'> &
    FirebaseQuery & {
        time: string;
        remark: string;
        reason: string;
        device: any;
        latlng: LatLng;
        status: string | number;
        approveBy: string;
        approveBySuid: string;
    };

export type UserCheckInDate = Pick<BaseProfile, 'suid' | 'email' | 'name'> &
    FirebaseQuery &
    LocationInfo & {
        date: string; // YYYY-MM-DD
        time: string;
        remark: string;
        reason: string;
        approveBy: string;
        approveBySuid: string;
        leavePeriod: LeavePeriodsType | null;
        leaveType?: LeaveTypes | null;
        absentId: string | null;
        isWorkOutside?: boolean;
    };

export type UserCheckinList = Pick<UserCheckInData, 'email' | 'suid' | 'reason' | 'remark' | 'time' | 'approveBy' | 'approveBySuid'>;
export type CheckinCalendar = FirebaseQuery & { date: string; wfhFlag?: number; userCheckinList: UserCheckInDate[] };

export type LeaveData = FirebaseQuery &
    Pick<BaseProfile, 'suid' | 'email' | 'name'> & {
        leaveType: LeaveTypes;
        leavePeriod: LeavePeriodsType;
        startDate: string; // date format: YYYY-MM-DD
        endDate: string; // date format: YYYY-MM-DD
        reason: string;
        status: LeaveStatus;
        rejectReason?: string;
        approveBy: string;
        approveBySuid: string;
        createdAt?: string; // Date
        updatedAt?: string; // Date
    };

export type WeeklyScheduleData = {
    startDate: string; // YYYY-MM-DD
    endDate: string; // YYYY-MM-DD
    userList: Pick<BaseProfile, 'name' | 'email' | 'suid'>[];
    createdAt?: Date; // Date
    updatedAt?: Date; // Date
};

// ----------------------------- new ------------------------
export type WorkTimes = {
    entryTime: string; // HH:mm
    exitTime: string; // HH:mm
};

export type WeeklyWorkingDays = {
    Friday: boolean;
    Monday: boolean;
    Saturday: boolean;
    Sunday: boolean;
    Thursday: boolean;
    Tuesday: boolean;
    Wednesday: boolean;
};
export type CalendarDateConfig = FirebaseQuery &
    WorkTimes & {
        date: string; // YYYY-MM-DD
        isHoliDay: boolean;
        isWFH?: boolean;
        remark?: string;
        createdAt?: Date; // Date
        updatedAt?: Date; // Date
    };

export type LocationInfo = {
    device?: any;
    latlng?: LatLng | null;
};

export type CheckinStatusInfo = {
    status: 0 | 1 | 99; // 0:unkown, 1: Approve, 99: Waiting
    approveBy: string;
    approveBySuid: string;
};

export type CheckinDate = Pick<BaseProfile, 'suid' | 'email' | 'name'> &
    FirebaseQuery &
    CheckinStatusInfo &
    LocationInfo & {
        date: string; // YYYY-MM-DD
        time?: string;
        remark?: string;
        reason?: string;
        isWorkOutside?: boolean;
        // leave info
        absentId?: string | null;
        leaveType?: LeaveTypes | null;
        leavePeriod?: LeavePeriodsType | null;
        createdAt?: string; // Date
        updatedAt?: string; // Date
    };

export type CalendarDateList = FirebaseQuery &
    CalendarDateConfig & {
        userCheckinList: CheckinDate[];
    };

export type SystemAreaConfig = FirebaseQuery & LatLng & { radius: number };

export type AnnualLeaveEntitlement = FirebaseQuery & {
    personal: number;
    sick: number;
    vacation: number;
    years: number;
};
