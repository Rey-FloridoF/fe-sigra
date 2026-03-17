import { Navbar } from "@/components/navbar"
import Footer from "@/components/footer";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 bg-gradient-to-br from-green-50 to-orange-50">
        {children}
      </main>
      <Footer />
    </div>
  )
}