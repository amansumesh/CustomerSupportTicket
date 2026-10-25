import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "NeuralDesk AI | Customer Support Ticket Triage & Classification",
  description: "Enterprise Support Ticket Classification and Triage Engine powered by Scikit-Learn ML models and MongoDB persistence.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
