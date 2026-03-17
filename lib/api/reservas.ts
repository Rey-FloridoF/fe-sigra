const api = process.env.NEXT_PUBLIC_API_URL

export interface ReservaPlato {
  opcionId: number
  cantidad: number
}

export interface ReservaPlatoData {
  id: number
  nombre: string
  cantidad: number
  precio: number
  elegible: boolean
}

export interface Reserva {
  id: number
  fechaReserva: string
  userId: number
  precioTotal?: number
  platos?: ReservaPlatoData[]
}

export interface ReservaWithPlatos extends Reserva {
  platos: ReservaPlatoData[]
  precioTotal: number
}

class ReservaService {
  private getHeaders(): HeadersInit {
    const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    }

    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    return headers
  }

  async getAllByUser(): Promise<ReservaWithPlatos[]> {
    try {
      const response = await fetch(`${api}/reserva/getAllReservationsUser`, {
        method: 'GET',
        headers: this.getHeaders(),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || 'Error al cargar las reservas')
      }

      return await response.json()
    } catch (err) {
      if (err instanceof TypeError && err.message.includes('fetch')) {
        throw new Error('No se pudo conectar con el servidor')
      }
      throw err
    }
  }

  async getById(id: number): Promise<ReservaWithPlatos> {
    try {
      const response = await fetch(`${api}/reserva/${id}`, {
        method: 'GET',
        headers: this.getHeaders(),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || 'Error al cargar la reserva')
      }

      return await response.json()
    } catch (err) {
      if (err instanceof TypeError && err.message.includes('fetch')) {
        throw new Error('No se pudo conectar con el servidor')
      }
      throw err
    }
  }

  async create(fecha: string, reservaPlatos: ReservaPlato[]): Promise<{ message: string }> {
    try {
      const fechaDate = new Date(fecha + "T00:00:00")
      
      const response = await fetch(`${api}/reserva/create`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          fecha: fechaDate.toISOString(),
          reservaPlatos,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || 'Error al crear la reserva')
      }

      return await response.json()
    } catch (err) {
      if (err instanceof TypeError && err.message.includes('fetch')) {
        throw new Error('No se pudo conectar con el servidor')
      }
      throw err
    }
  }

  async update(id: number, fecha: string, reservaPlatos: ReservaPlato[]): Promise<{ message: string }> {
    try {
      const fechaDate = new Date(fecha + "T00:00:00")
      
      const response = await fetch(`${api}/reserva/update/${id}`, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify({
          fecha: fechaDate.toISOString(),
          reservaPlatos,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || 'Error al actualizar la reserva')
      }

      return await response.json()
    } catch (err) {
      if (err instanceof TypeError && err.message.includes('fetch')) {
        throw new Error('No se pudo conectar con el servidor')
      }
      throw err
    }
  }

  async delete(id: number): Promise<{ message: string }> {
    try {
      const response = await fetch(`${api}/reserva/destroy/${id}`, {
        method: 'DELETE',
        headers: this.getHeaders(),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || 'Error al cancelar la reserva')
      }

      return await response.json()
    } catch (err) {
      if (err instanceof TypeError && err.message.includes('fetch')) {
        throw new Error('No se pudo conectar con el servidor')
      }
      throw err
    }
  }

  async getAllMenusWithReservations(): Promise<MenuWithReservations[]> {
    try {
      const response = await fetch(`${api}/reserva/getAllMenusWithReservations`, {
        method: 'GET',
        headers: this.getHeaders(),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || 'Error al cargar los menús')
      }

      return await response.json()
    } catch (err) {
      if (err instanceof TypeError && err.message.includes('fetch')) {
        throw new Error('No se pudo conectar con el servidor')
      }
      throw err
    }
  }

  async getReservationsByMenu(menuId: number): Promise<ReservationsByMenu> {
    try {
      const response = await fetch(`${api}/reserva/getReservationsByMenu/${menuId}`, {
        method: 'GET',
        headers: this.getHeaders(),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || 'Error al cargar las reservaciones')
      }

      return await response.json()
    } catch (err) {
      if (err instanceof TypeError && err.message.includes('fetch')) {
        throw new Error('No se pudo conectar con el servidor')
      }
      throw err
    }
  }
}

export interface MenuOpcion {
  id: number
  nombre: string
  elegible: boolean
}

export interface MenuWithReservations {
  id: number
  fecha: string
  publicado: boolean
  cantidadReservaciones: number
  opciones: MenuOpcion[]
}

export interface EmpleadoReserva {
  id: number
  nombre: string
  opciones: Record<number, number>
}

export interface ReservationsByMenu {
  menuId: number
  fecha: string
  opciones: MenuOpcion[]
  totalPorOpcion: Record<number, number>
  empleados: EmpleadoReserva[]
}

export const reservaService = new ReservaService()
