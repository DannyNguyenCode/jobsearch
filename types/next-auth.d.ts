import type { UserRole } from "@/lib/types";
import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface User {
    id: string;
    role: UserRole;
    fullName: string;
    referenceCode: string;
    staySignedIn?: boolean;
  }

  interface Session {
    user: {
      id: string;
      role: UserRole;
      fullName: string;
      referenceCode: string;
    } & DefaultSession["user"];
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    id?: string;
    role?: UserRole;
    fullName?: string;
    referenceCode?: string;
    staySignedIn?: boolean;
  }
}
