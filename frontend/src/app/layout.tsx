import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "My App",
    description: "Built with Next.js and Tailwind CSS",
};

export default function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
        <body suppressHydrationWarning>{children}</body>
        </html>
    );
}