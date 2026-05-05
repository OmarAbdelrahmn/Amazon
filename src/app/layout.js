import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import I18nProvider from "@/components/I18nProvider";
import AuthGuard from "@/components/AuthGuard";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata = {
  title: "Amazon Logistics Dashboard",
  description: "Advanced order management and reporting system",
};

export default function RootLayout({ children }) {
  return (
    <html className={jakarta.variable}>
      <body>
        <I18nProvider>
          <AuthGuard>
            {children}
          </AuthGuard>
        </I18nProvider>
      </body>
    </html>
  );
}