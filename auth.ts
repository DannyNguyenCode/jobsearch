import NextAuth, { CredentialsSignin } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { loginSchema } from "@/lib/validators/auth";
import { isRememberDevice, REMEMBER_MAX_AGE, sessionMaxAgeSeconds } from "@/lib/session-duration";
import type { UserRole } from "@/lib/types";

class InvalidCredentialsError extends CredentialsSignin {
  code = "invalid_credentials";
}

class UnverifiedEmailError extends CredentialsSignin {
  code = "email_unverified";
}

function dashboardForRole(role: UserRole) {
  return role === "recruiter" ? "/recruiter/dashboard" : "/applicant/dashboard";
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  session: { strategy: "jwt", maxAge: REMEMBER_MAX_AGE },
  pages: { signIn: "/login" },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        remember: { label: "Remember this device", type: "text" },
      },
      authorize: async (credentials) => {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) throw new InvalidCredentialsError();

        const { dbConnect } = await import("@/lib/db");
        const { User } = await import("@/lib/models/User");
        const bcrypt = (await import("bcryptjs")).default;

        await dbConnect();
        const user = await User.findOne({ email: parsed.data.email }).select("+password");
        if (!user?.password) throw new InvalidCredentialsError();

        const passwordOk = await bcrypt.compare(parsed.data.password, user.password);
        if (!passwordOk) throw new InvalidCredentialsError();
        if (!user.emailVerified) throw new UnverifiedEmailError();

        user.lastLoggedIn = new Date();
        await user.save();

        return {
          id: String(user._id),
          email: user.email,
          name: user.fullName,
          role: user.role,
          fullName: user.fullName,
          referenceCode: user.referenceCode ?? "",
          staySignedIn: isRememberDevice(parsed.data.remember),
        };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.fullName = user.fullName;
        token.referenceCode = user.referenceCode ?? "";
        token.staySignedIn = user.staySignedIn !== false;
        token.exp = Math.floor(Date.now() / 1000) + sessionMaxAgeSeconds(token.staySignedIn);
      }
      if (trigger === "update" && session && typeof session === "object" && "referenceCode" in session) {
        token.referenceCode = String(session.referenceCode ?? "");
      }
      return token;
    },
    session({ session, token }) {
      session.user.id = String(token.id ?? "");
      session.user.role = token.role === "recruiter" ? "recruiter" : "applicant";
      session.user.fullName = String(token.fullName ?? "");
      session.user.referenceCode = String(token.referenceCode ?? "");
      session.user.name = session.user.fullName;
      return session;
    },
    authorized({ request, auth: session }) {
      const { pathname } = request.nextUrl;
      const role = session?.user?.role;
      const isApplicantPath = pathname.startsWith("/applicant");
      const isRecruiterPath = pathname.startsWith("/recruiter");
      const isAuthPage =
        pathname === "/login" ||
        pathname === "/register" ||
        pathname === "/verify-email" ||
        pathname === "/forgot-password";

      if (isApplicantPath) {
        if (role === "applicant") return true;
        if (role === "recruiter") {
          return Response.redirect(new URL("/recruiter/dashboard", request.url));
        }
        return false;
      }

      if (isRecruiterPath) {
        if (role === "recruiter") return true;
        if (role === "applicant") {
          return Response.redirect(new URL("/applicant/dashboard", request.url));
        }
        return false;
      }

      if (isAuthPage && role) {
        return Response.redirect(new URL(dashboardForRole(role), request.url));
      }

      return true;
    },
  },
});
