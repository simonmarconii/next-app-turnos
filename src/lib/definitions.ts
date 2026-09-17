import { ScheduleStatus } from "../../generated/prisma";

export type ServiceType = {
    id: string;
    created_at: Date;
    name: string;
    price: number;
    active: boolean;
}

export type UserType = {
    id: string;
    created_at: Date;
    name: string;
    lastname: string;
    email: string;
    phone: string;
}

export type DateType = {
    service?: ServiceType;
    user?: UserType;
} & {
    id: string;
    created_at: Date;
    date: Date;
    service_id: string;
    user_id: string;
    status: ScheduleStatus;
    updated_at: Date;
    expires_in: Date | null;
} | null;