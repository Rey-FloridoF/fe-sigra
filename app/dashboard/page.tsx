"use client"

import { parseJwt } from "@/components/navbar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Calendar, Utensils, UserCheck, AlertCircle, CheckCircle, XCircle } from "lucide-react"
import { useEffect, useState } from "react"
import { estadisticasService } from "@/lib/api/estadisticas"

interface User {
  role: string
  name: string
}

interface PlatoMasReservado {
  platoId: number
  nombre: string
  cantidad: number
}

interface MenuHoy {
  existe: boolean
  opciones: {
    id: number
    nombre: string
    descripcion: string
    precio: number
    elegible: boolean
  }[]
}

interface UsuarioTop {
  usuarioId: number
  nombre: string
  cantidadReservas: number
}

interface AdminData {
  reservasHoy: number
  totalUsuarios: number
  menuHoy: MenuHoy
  platosMasReservados: PlatoMasReservado[]
  usuariosTop: UsuarioTop[]
  platoMasReservadoHoy: {
    existe: boolean
    nombre?: string
    cantidad?: number
  }
}

interface Reserva {
  id: number
  fechaReserva: string
  precioTotal: number
  platos: {
    id: number
    nombre: string
    cantidad: number
    precio: number
    elegible: boolean
  }[]
}

interface UsuarioData {
  reservaHoy: {
    tieneReserva: boolean
    reserva?: Reserva
  }
  cantidadReservas: number
  platoMasReservado: {
    existe: boolean
    nombre?: string
    cantidad?: number
  }
  menuHoy: MenuHoy
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [adminData, setAdminData] = useState<AdminData | null>(null)
  const [usuarioData, setUsuarioData] = useState<UsuarioData | null>(null)

  useEffect(() => {
    const token = localStorage.getItem("authToken")
    if (!token) return

    const decoded = parseJwt(token) as User
    if (!decoded?.role || !decoded?.name) return

    setUser({
      role: decoded.role,
      name: decoded.name,
    })
  }, [])

  useEffect(() => {
    if (!user) return

    if (user.role === "ADMIN") {
      loadEstadisticasAdmin()
    } else {
      loadEstadisticasUsuario()
    }
  }, [user])

  const loadEstadisticasAdmin = async () => {
    try {
      setLoading(true)
      setError(null)
      const result = await estadisticasService.getDashboard()
      setAdminData({
        reservasHoy: result.reservasHoy.cantidad,
        totalUsuarios: result.totalUsuarios.cantidad,
        menuHoy: result.menuHoy,
        platosMasReservados: result.platosMasReservados,
        usuariosTop: result.usuariosTop,
        platoMasReservadoHoy: result.platoMasReservadoHoy,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar estadísticas")
    } finally {
      setLoading(false)
    }
  }

  const loadEstadisticasUsuario = async () => {
    try {
      setLoading(true)
      setError(null)
      const result = await estadisticasService.getDashboardUsuario()
      setUsuarioData({
        reservaHoy: result.reservaHoy,
        cantidadReservas: result.cantidadReservas.cantidad,
        platoMasReservado: result.platoMasReservado,
        menuHoy: result.menuHoy,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar estadísticas")
    } finally {
      setLoading(false)
    }
  }

  if (!user) return null

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="p-4 border border-red-200 bg-red-50 text-red-700 rounded-md flex items-center gap-2">
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      </div>
    )
  }

  if (user.role !== "ADMIN") {
    return (
      <DashboardUsuario 
        user={user} 
        data={usuarioData} 
      />
    )
  }

  const maxPlatoCantidad = adminData?.platosMasReservados.length 
    ? Math.max(...adminData.platosMasReservados.map(p => p.cantidad))
    : 1

  const maxUsuarioReservas = adminData?.usuariosTop.length
    ? Math.max(...adminData.usuariosTop.map(u => u.cantidadReservas))
    : 1

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">
          Inicio
        </h1>
        <p className="text-muted-foreground">
          Bienvenido {user.name}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Reservas Hoy
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{adminData?.reservasHoy || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Usuarios Registrados
            </CardTitle>
            <Utensils className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{adminData?.totalUsuarios || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Menú del Día
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {adminData?.menuHoy?.existe ? adminData.menuHoy.opciones.length : 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {adminData?.menuHoy?.existe ? (adminData.menuHoy.opciones.length > 0 ? 'Publicado' : 'Sin opciones') : 'No publicado'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Plato Más Reservado Hoy
            </CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {adminData?.platoMasReservadoHoy?.existe ? (
              <>
                <div className="text-xl font-bold truncate">
                  {adminData.platoMasReservadoHoy.nombre}
                </div>
                <p className="text-xs text-muted-foreground">
                  {adminData.platoMasReservadoHoy.cantidad} reservas
                </p>
              </>
            ) : (
              <div className="text-lg font-bold text-muted-foreground">
                Sin datos
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>5 Platos Más Reservados</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {adminData?.platosMasReservados && adminData.platosMasReservados.length > 0 ? (
              adminData.platosMasReservados.map((plato, idx) => (
                <div key={idx} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="truncate max-w-[200px]">{plato.nombre}</span>
                    <span className="font-medium">{plato.cantidad}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${(plato.cantidad / maxPlatoCantidad) * 100}%` }}
                    />
                  </div>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground text-sm">No hay datos disponibles</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top 5 Usuarios con Más Reservas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {adminData?.usuariosTop && adminData.usuariosTop.length > 0 ? (
              adminData.usuariosTop.map((usuario, idx) => (
                <div key={idx} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="truncate max-w-[200px]">{usuario.nombre}</span>
                    <span className="font-medium">{usuario.cantidadReservas}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full"
                      style={{ width: `${(usuario.cantidadReservas / maxUsuarioReservas) * 100}%` }}
                    />
                  </div>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground text-sm">No hay datos disponibles</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Menú de Hoy</CardTitle>
        </CardHeader>
        <CardContent>
          {adminData?.menuHoy?.existe ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {adminData.menuHoy.opciones.map((opcion) => (
                <div
                  key={opcion.id}
                  className="p-4 border rounded-lg"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium">{opcion.nombre}</h3>
                    {!opcion.elegible && (
                      <span className="text-xs bg-orange-200 text-orange-800 px-2 py-0.5 rounded">
                        Obligatorio
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{opcion.descripcion}</p>
                  <p className="text-sm font-medium">${opcion.precio.toFixed(2)}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">No hay menú publicado para hoy</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function DashboardUsuario({ 
  user, 
  data 
}: { 
  user: User
  data: UsuarioData | null 
}) {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">
          Bienvenido {user.name}
        </h1>
        <p className="text-muted-foreground mt-2">
          Aquí puedes realizar tus reservas de alimentos.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Estado de Reserva Hoy
            </CardTitle>
            {data?.reservaHoy?.tieneReserva ? (
              <CheckCircle className="h-4 w-4 text-green-500" />
            ) : (
              <XCircle className="h-4 w-4 text-red-500" />
            )}
          </CardHeader>
          <CardContent>
            {data?.reservaHoy?.tieneReserva ? (
              <div className="text-xl font-bold text-green-600">Con reserva</div>
            ) : (
              <div className="text-xl font-bold text-red-500">Sin reserva</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Total de Reservas
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.cantidadReservas || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Tu Plato Favorito
            </CardTitle>
            <Utensils className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {data?.platoMasReservado?.existe ? (
              <>
                <div className="text-lg font-bold truncate">
                  {data.platoMasReservado.nombre}
                </div>
                <p className="text-xs text-muted-foreground">
                  {data.platoMasReservado.cantidad} veces
                </p>
              </>
            ) : (
              <div className="text-lg font-bold text-muted-foreground">
                Sin datos
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {data?.reservaHoy?.tieneReserva && data.reservaHoy.reserva && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              Tu Reserva de Hoy
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {data.reservaHoy.reserva.platos.map((plato, idx) => (
              <div key={idx} className="flex justify-between items-center p-3 border rounded-lg">
                <div>
                  <p className="font-medium">{plato.nombre}</p>
                  {!plato.elegible && (
                    <span className="text-xs bg-orange-200 text-orange-800 px-2 py-0.5 rounded">
                      Obligatorio
                    </span>
                  )}
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold">x{plato.cantidad}</div>
                  <div className="text-sm text-muted-foreground">${plato.precio?.toFixed(2)}</div>
                </div>
              </div>
            ))}
            <div className="flex justify-end pt-3 border-t">
              <span className="text-lg font-bold">
                Total: ${data.reservaHoy.reserva.precioTotal?.toFixed(2) || '0.00'}
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Menú de Hoy</CardTitle>
        </CardHeader>
        <CardContent>
          {data?.menuHoy?.existe ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {data.menuHoy.opciones.map((opcion) => (
                <div
                  key={opcion.id}
                  className={`p-4 border rounded-lg ${!data.reservaHoy?.tieneReserva ? 'opacity-100' : ''}`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium">{opcion.nombre}</h3>
                    {!opcion.elegible && (
                      <span className="text-xs bg-orange-200 text-orange-800 px-2 py-0.5 rounded">
                        Obligatorio
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{opcion.descripcion}</p>
                  <p className="text-sm font-medium">${opcion.precio.toFixed(2)}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">No hay menú publicado para hoy</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
