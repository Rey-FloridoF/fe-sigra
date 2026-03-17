
import Image from "next/image";

export default function Footer() {
  return (
    <footer className="bg-white/50 backdrop-blur-sm border-t border-gray-200">
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Logo + Dirección */}
          <div className="flex items-center gap-3">
            <Image 
              src="/logotipo_dcballos.jpg" 
              alt="Logotipo DCballos" 
              width={160} 
              height={48} 
              className="object-contain"
            />
            <div>
              <p className="text-sm text-gray-600">Dirección Empresa</p>
            </div>
          </div>
          
          {/* Derechos reservados */}
          <div className="text-center text-sm text-gray-600">
            © {new Date().getFullYear()} DCballos • Sistema SIGRA • Todos los derechos reservados
          </div>
        </div>
      </div>
    </footer>
  );
}
