import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: {
    signIn: "/login", // redirect ke halaman login jika belum auth
  },
});

export const config = {
  matcher: ["/dashboard/:path*"], // proteksi hanya halaman /dashboard
};