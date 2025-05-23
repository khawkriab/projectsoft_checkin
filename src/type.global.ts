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

export type Profile = EmployeeInfo &
    SheetInfo & {
        id: string;
        token?: string;
        fullName: string;
        profileURL?: string;
        email: string;
        role: 'ADMIN' | 'STAFF' | 'USER';
    };

export type UserCheckInData = {
    id: string;
    time: string;
    remark: string;
    reason: string;
    device: string;
    location: string;
    status: string;
};
