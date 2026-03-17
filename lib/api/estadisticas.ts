const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'

interface PlatoMasReservado {
  platoId: number
  nombre: string
  cantidad: number
}

interface MenuHoy {
  existe: boolean
  mensaje?: string
  fecha?: string
  publicado?: boolean
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

interface PlatoMasReservadoHoy {
  existe: boolean
  mensaje?: string
  platoId?: number
  nombre?: string
  cantidad?: number
}

interface ReservaHoy {
  tieneReserva: boolean
  mensaje?: string
  reserva?: {
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
}

interface EstadisticasDashboard {
  reservasHoy: {
    cantidad: number
  }
  platosMasReservados: PlatoMasReservado[]
  totalUsuarios: {
    cantidad: number
  }
  menuHoy: MenuHoy
  usuariosTop: UsuarioTop[]
  platoMasReservadoHoy: PlatoMasReservadoHoy
}

interface EstadisticasUsuario {
  reservaHoy: ReservaHoy
  cantidadReservas: {
    cantidad: number
  }
  platoMasReservado: PlatoMasReservadoHoy
  menuHoy: MenuHoy
}

async function getAuthHeaders(): Promise<HeadersInit> {
  const token = localStorage.getItem('authToken')
  return {
    'Content-Type': 'application/json',
    Authorization: token ? `Bearer ${token}` : '',
  }
}

export const estadisticasService = {
  async getDashboard(): Promise<EstadisticasDashboard> {
    const res = await fetch(`${API_URL}/estadisticas/dashboard`, {
      headers: await getAuthHeaders(),
      cache: 'no-store',
    })
    if (!res.ok) throw new Error('Error al cargar estadísticas')
    return res.json()
  },

  async getReservasHoy(): Promise<{ cantidad: number }> {
    const res = await fetch(`${API_URL}/estadisticas/reservas-hoy`, {
      headers: await getAuthHeaders(),
      cache: 'no-store',
    })
    if (!res.ok) throw new Error('Error al cargar reservas de hoy')
    return res.json()
  },

  async getPlatosMasReservados(): Promise<PlatoMasReservado[]> {
    const res = await fetch(`${API_URL}/estadisticas/platos-mas-reservados`, {
      headers: await getAuthHeaders(),
      cache: 'no-store',
    })
    if (!res.ok) throw new Error('Error al cargar platos más reservados')
    return res.json()
  },

  async getTotalUsuarios(): Promise<{ cantidad: number }> {
    const res = await fetch(`${API_URL}/estadisticas/total-usuarios`, {
      headers: await getAuthHeaders(),
      cache: 'no-store',
    })
    if (!res.ok) throw new Error('Error al cargar total de usuarios')
    return res.json()
  },

  async getMenuHoy(): Promise<MenuHoy> {
    const res = await fetch(`${API_URL}/estadisticas/menu-hoy`, {
      headers: await getAuthHeaders(),
      cache: 'no-store',
    })
    if (!res.ok) throw new Error('Error al cargar menú de hoy')
    return res.json()
  },

  async getUsuariosTop(): Promise<UsuarioTop[]> {
    const res = await fetch(`${API_URL}/estadisticas/usuarios-top`, {
      headers: await getAuthHeaders(),
      cache: 'no-store',
    })
    if (!res.ok) throw new Error('Error al cargar usuarios top')
    return res.json()
  },

  async getDashboardUsuario(): Promise<EstadisticasUsuario> {
    const res = await fetch(`${API_URL}/estadisticas/dashboard-usuario`, {
      headers: await getAuthHeaders(),
      cache: 'no-store',
    })
    if (!res.ok) throw new Error('Error al cargar estadísticas del usuario')
    return res.json()
  },

  async getGastoMesActual(): Promise<{ mes: number; anio: number; mesNombre: string; gasto: number }> {
    const res = await fetch(`${API_URL}/estadisticas/historial/gasto-mes-actual`, {
      headers: await getAuthHeaders(),
      cache: 'no-store',
    })
    if (!res.ok) throw new Error('Error al cargar gasto del mes actual')
    return res.json()
  },

  async getGastoTotal(): Promise<{ gasto: number; cantidadReservas: number }> {
    const res = await fetch(`${API_URL}/estadisticas/historial/gasto-total`, {
      headers: await getAuthHeaders(),
      cache: 'no-store',
    })
    if (!res.ok) throw new Error('Error al cargar gasto total')
    return res.json()
  },

  async getGastoPorMes(anio: number): Promise<{ anio: number; meses: { mes: number; mesNombre: string; gasto: number }[] }> {
    const res = await fetch(`${API_URL}/estadisticas/historial/gasto-por-mes?anio=${anio}`, {
      headers: await getAuthHeaders(),
      cache: 'no-store',
    })
    if (!res.ok) throw new Error('Error al cargar gasto por mes')
    return res.json()
  },
}
