export type SheetData = {
    range: string;
    majorDimension: string;
    values: string[][];
};

export type SheetInfo = {
    sheetRowNumber?: number;
};

export type EmployeeInfo = {
    name?: string;
    phoneNumber?: string;
    jobPosition?: string;
    employmentType?: string;
};

export type FirebaseQuery = {
    id?: string;
};

export type Profile = EmployeeInfo &
    SheetInfo &
    FirebaseQuery & {
        googleId: string;
        token?: string;
        fullName: string;
        profileURL?: string;
        email: string;
        role: 'ADMIN' | 'STAFF' | 'USER';
        status?: 'APPROVE' | 'WAITING' | 'NO_REGIST';
    };

export type UserCheckInData = FirebaseQuery & {
    name?: string;
    googleId: string;
    email?: string;
    time: string;
    remark: string;
    reason: string;
    device: string;
    latlng: string | LatLng;
    status: string | number;
    createdAt?: Date;
    createdBy?: string | number;
};

export type LatLng = { lat: number; lng: number };
export type UserCheckinList = Pick<UserCheckInData, 'email' | 'googleId' | 'reason' | 'remark' | 'time'>;
export type CheckinCalendar = FirebaseQuery & { date: string; userCheckinList: UserCheckinList[] };
