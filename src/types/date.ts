import { UserType } from "./user";
import { ServiceType } from "./service";

export type DateType = {
    id: string;
    user_id: string;
    user: UserType;
    service_id: string;
    service: ServiceType;
    date: string;
    created_at: string;
}