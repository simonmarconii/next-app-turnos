import { UserType } from "./user";
import { ServiceType } from "./service";

export type DateType = {
    id: string;
    user_id: string;
    user: UserType;
    service_id: string;
    service: ServiceType;
    date: string;
    status: "pendiente" | "confirmado" | "cancelado" | "completado";
    expires_in: string | null;
    updated_at: string;
    created_at: string;
}