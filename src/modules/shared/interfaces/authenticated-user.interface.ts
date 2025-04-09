import { AuthTypeEnum } from "@shared/enums/auth-type.enum";

export interface AuthenticatedUserInterface {
  id: string;
  role: AuthTypeEnum;
}
