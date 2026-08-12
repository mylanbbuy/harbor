export const dynamic = 'force-dynamic'
 
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
import "./globals.css";
import { AuthProvider } from "@/components/AuthContext";
import { CartProvider } from "@/components/CartContext";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

export const metadata = {
  title: "Harbor — Electronics, Repair & IT Services in Zanzibar",
  description: "Harbor sells laptops, smartphones, and networking equipment, and provides repair and IT services in Zanzibar, Tanzania.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ background: "#0A0D12", minHeight: "100vh" }}>
        <AuthProvider>
          <CartProvider>
            <Nav />
            <main style={{ minHeight: "60vh" }}>{children}</main>
            <Footer />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
