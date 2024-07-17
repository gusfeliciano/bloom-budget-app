import './globals.css'
import Sidebar from '../components/layout/Sidebar'
import Header from '../components/layout/Header'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <div className="flex h-screen">
          <Sidebar />
          <div className="flex-1 flex flex-col">
            <Header />
            <main className="flex-1 p-6 bg-gray-100">
              {children}
            </main>
          </div>
        </div>
      </body>
    </html>
  )
}