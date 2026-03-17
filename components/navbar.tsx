"use client"

import Link from "next/link"
import Image from "next/image"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import {
  Home,
  User,
  LogOut,
  Menu,
  Users2Icon,
  Building2Icon,
  UtensilsCrossedIcon,
  ClipboardListIcon,
  CalendarPlus,
  CalendarCheck,
  FileTextIcon,
  History,
} from "lucide-react"
import { useRouter } from "next/navigation"

// Función para decodificar el token JWT
export function parseJwt(token: string) {
  try {
    const base64Url = token.split('.')[1]
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(function (c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
        })
        .join('')
    )
    return JSON.parse(jsonPayload)
  } catch (error) {
    console.error('Error decoding token:', error)
    return null
  }
}

export function Navbar() {
  const [user, setUser] = useState<{ name: string; role: string } | null>(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // Verificar autenticación
    const checkAuth = () => {
      // Usar la clave correcta (debería ser 'token' según tu logout)
      const token = localStorage.getItem('authToken')

      if (!token) {
        // Redirigir a la página de autenticación si no hay token
        router.push('/auth')
        return
      }

      try {
        // Decodificar el token JWT
        const decodedToken = parseJwt(token)

        if (decodedToken) {
          // Establecer el usuario con los datos del payload
          setUser({
            name: decodedToken.name || 'Usuario',
            role: decodedToken.role
          })
        } else {
          // Token inválido, redirigir
          handleLogout()
        }
      } catch (error) {
        console.error('Error parsing token:', error)
        handleLogout()
      }
    }

    checkAuth()

    // También puedes escuchar cambios en el localStorage
    const handleStorageChange = () => {
      checkAuth()
    }

    window.addEventListener('storage', handleStorageChange)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem('authToken')
    router.push('/auth')
  }

  const navigation = user?.role === "ADMIN"
    ? [
        { name: "Inicio", href: "/dashboard", icon: Home },
        { name: "Usuarios", href: "/dashboard/users", icon: Users2Icon },
        { name: "Departamentos", href: "/dashboard/departament", icon: Building2Icon },
        { name: "Platos", href: "/dashboard/dishe", icon: UtensilsCrossedIcon },
        { name: "Menús", href: "/dashboard/menu", icon: ClipboardListIcon },
        { name: "Reservaciones", href: "/dashboard/reservations", icon: CalendarCheck },
        { name: "Reportes", href: "/dashboard/reports", icon: FileTextIcon },
      ]
    : [
        { name: "Inicio", href: "/dashboard", icon: Home },
        { name: "Reservar", href: "/dashboard/app_user/reserve", icon: CalendarPlus },
        { name: "Mis reservaciones", href: "/dashboard/app_user/my_reservations", icon: CalendarCheck },
        { name: "Historial", href: "/dashboard/app_user/historial", icon: History },
      ]

  if (!user) {
    return (
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto max-w-6xl flex h-16 items-center justify-between px-4">
          <Link href="/dashboard" className="flex items-center space-x-2">
            <Image
              src="/logo_sigra.png"
              alt="SiGRA Logo"
              width={80}
              height={40}
              className="h-10 w-auto"
            />
          </Link>
        <div className="flex items-center space-x-2">
            <span className="text-sm text-muted-foreground">Cargando...</span>
          </div>
        </div>
      </header>
    )
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 lg:px-8 flex h-16 items-center justify-between">
        {/* Logo */}
        <Link href="/dashboard" className="flex items-center space-x-2">
          <img
            src="/logo_sigra.png"
            alt="SiGRA Logo"
            width={80}
            height={40}
            className="h-10 w-auto"
          />
        </Link>

        <div className="hidden md:flex items-center space-x-3">
          {/* Desktop Navigation */}
          <nav className="flex items-center space-x-2">
            {navigation.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className="flex items-center space-x-2 text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.name}</span>
                </Link>
              )
            })}
          </nav>

          {/* User Menu */}
          <div className="flex items-center">
            <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                <Avatar className="h-10 w-10">
                  <AvatarImage src="" alt={user.name} />
                  <AvatarFallback>
                    <User className="h-5 w-5" />
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <div className="flex items-center justify-start gap-2 p-2">
                <div className="flex flex-col space-y-1 leading-none">
                  <p className="font-medium">Hola, {user.name}</p>                  
                </div>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Cerrar sesión</span>
              </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Mobile Menu */}
        <div className="md:hidden">
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Abrir menú</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <div className="flex flex-col space-y-4 mt-6">
                <Link href="/dashboard" className="flex items-center space-x-2">
                  <img
                    src="/logo_sigra.png"
                    alt="SiGRA Logo"
                    width={80}
                    height={40}
                    className="h-8 w-auto"
                  />
                </Link>
                <nav className="flex flex-col space-y-3">
                  {navigation.map((item) => {
                    const Icon = item.icon
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center space-x-3 text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
                      >
                        <Icon className="h-5 w-5" />
                        <span>{item.name}</span>
                      </Link>
                    )
                  })}
                </nav>
                <div className="pt-4 border-t">
                  <p className="font-medium">Hola, {user.name}</p>
                  
                  <Button
                    onClick={() => {
                      setMobileMenuOpen(false)
                      handleLogout()
                    }}
                    variant="ghost"
                    className="w-full justify-start mt-2"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Cerrar sesión</span>
                  </Button>
                </div>
              </div>
              </SheetContent>
            </Sheet>
          </div>
      </div>
    </header>
  )
}