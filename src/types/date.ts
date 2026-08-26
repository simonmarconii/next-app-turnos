import { UserType } from "./user";
import { ServiceType } from "./service";
import { ScheduleStatus } from "../../generated/prisma";

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