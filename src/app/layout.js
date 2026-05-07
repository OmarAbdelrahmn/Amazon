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
  title: 'Express Service - Smart Logistics Solution',
  description: 'Express Service is a comprehensive Logistics Management System designed to streamline delivery operations. Manage riders, track shipments, and generate detailed reports efficiently.',
  metadataBase: new URL('https://forsenex.com'),
  icons: {
    icon: '/5.png',
  },

  openGraph: {
    title: 'Express Service - Smart Logistics Solution',
    description: 'Express Service is a comprehensive Logistics Management System designed to streamline delivery operations. Manage riders, track shipments, and generate detailed reports efficiently.',
    siteName: 'Express Service',
    images: [
      {
        url: '/5.png',
        width: 1200,
        height: 630,
        alt: 'Express Service Dashboard',
      },
    ],
    type: 'website',
  },
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