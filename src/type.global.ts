export type ProfileRole = 'ADMIN' | 'STAFF' | 'USER';
export type ProfileStatus = 'APPROVE' | 'WAITING' | 'NO_REGIST' | 'INACTIVE';
export type AbsentStatus = 'APPROVE' | 'WAITING' | 'REJECT';
export type LeaveTypes = 'VACATION' | 'SICK' | 'PERSONAL';
export type LeavePeriodsType = 'HALF_DAY_AM' | 'HALF_DAY_PM' | 'FULL_DAY';
export type LeavePeriodsLabel = 'ลาเช้า' | 'ลาบ่าย' | 'ทั้งวัน';

export type LatLng = { lat: number; lng: number };

export type StandardResponse<T = any> = T & FirebaseQuery;

export type BaseData = {
    createdAt?: Date | string;
    updateAt?: Date | string;
};

export type BaseProfile = {
    suid?: string;
    name: string;
    allowFindLocation?: number;
    googleId: string;
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
    employmentStartDate: string;
    employmentEndDate?: string;
};

export type FirebaseQuery = BaseData & {
    id?: string;
};

export type Profile = BaseProfile & EmployeeInfo & FirebaseQuery & BaseData;

export type UserCheckInData = Pick<BaseProfile, 'googleId' | 'email' | 'name'> &
    FirebaseQuery & {
        time: string;
        remark: string;
        reason: string;
        device: any;
        latlng: LatLng;
        status: string | number;
        approveBy: string;
        approveByGoogleId: string;
    };

export type UserCheckInDate = Pick<BaseProfile, 'googleId' | 'email' | 'name'> &
    FirebaseQuery & {
        date: string; // YYYY-MM-DD
        time: string;
        remark: string;
        reason: string;
        approveBy: string;
        approveByGoogleId: string;
        leavePeriod: LeavePeriodsType | null;
        leaveType?: LeaveTypes | null;
        absentId: string | null;
        isWFH?: boolean;
    };

export type UserCheckinList = Pick<
    UserCheckInData,
    'email' | 'googleId' | 'reason' | 'remark' | 'time' | 'approveBy' | 'approveByGoogleId'
>;
export type CheckinCalendar = FirebaseQuery & { date: string; wfhFlag?: number; userCheckinList: UserCheckInDate[] };

export type CalendarDateConfig = {
    date: string; // YYYY-MM-DD
    isOffDay: boolean;
    isHalfDay: boolean;
    isWFH: boolean;
    remark?: string;
    entryTime: string; // HH:mm
    exitTime?: string; // HH:mm
    createdAt?: Date; // Date
    updatedAt?: Date; // Date
};

export type AbsentData = FirebaseQuery &
    Pick<BaseProfile, 'googleId' | 'email' | 'name'> & {
        leaveType: LeaveTypes;
        leavePeriod: LeavePeriodsType;
        startDate: string; // date format: YYYY-MM-DD
        endDate: string; // date format: YYYY-MM-DD
        reason: string;
        status: AbsentStatus;
        rejectReason?: string;
        approveBy: string;
        approveByGoogleId: string;
        createdAt?: string; // Date
        updatedAt?: string; // Date
    };

export type WeeklyScheduleData = {
    startDate: string; // YYYY-MM-DD
    endDate: string; // YYYY-MM-DD
    userList: Pick<BaseProfile, 'name' | 'email' | 'googleId'>[];
    createdAt?: Date; // Date
    updatedAt?: Date; // Date
};
