import Link from "next/link";
import Image from "next/image";
import Footer from "@/components/footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-orange-50 flex flex-col">
      {/* Header */}
      <header className="p-6 lg:px-12">
        <div className="max-w-6xl w-full mx-auto flex justify-between items-center">
          <Image
            src="/logo_sigra.png"
            alt="SIGRA Logo"
            width={160}
            height={48}
            className="object-contain"
          />

          <Link
            href="/auth"
            className="text-gray-700 hover:text-green-700 font-medium transition-colors"
          >
            Iniciar Sesión
          </Link>

        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="max-w-6xl w-full">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Text Content */}
            <div className="text-center lg:text-left space-y-6">
              <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
                Sistema de Gestión de Reservas de Alimentos
              </h1>

              <p className="text-lg text-gray-700 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                Optimiza la gestión de reservas en DCballos con nuestra plataforma integral.
                Control eficiente, reportes detallados y experiencia simplificada para todos los usuarios.
              </p>

              <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
                <div className="flex items-center gap-2 text-gray-600">
                  <span className="text-green-600 text-xl">📋</span>
                  <span>Gestión Centralizada</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <span className="text-orange-600 text-xl">💰</span>
                  <span>Control de Gastos</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <span className="text-green-600 text-xl">📊</span>
                  <span>Reportes Detallados</span>
                </div>
              </div>
            </div>

            {/* Image */}
            <div className="relative">
              <Image
                src="/comedor.jpg"
                alt="Comedor de la Direccion de la Empresa DCbllos"
                width={600}
                height={400}
                className="rounded-2xl shadow-2xl w-full"
                priority
              />
            </div>
          </div>
        </div>
      </main>

      <Footer></Footer>

    </div>
  );
}