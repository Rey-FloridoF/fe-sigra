const api = process.env.NEXT_PUBLIC_API_URL

export interface Reporte {
  id: number
  nombre: string
  fechaInicio: string | Date
  fechaFin: string | Date
  createdAt?: string | Date
}

export interface ReporteResponse {
  message: string
  id?: number
  nombre?: string
  fechaInicio?: string | Date
  fechaFin?: string | Date
}

class ReporteService {
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

  async getAll(): Promise<Reporte[]> {
    try {
      const response = await fetch(`${api}/reporte`, {
        method: 'GET',
        headers: this.getHeaders(),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || 'Error al cargar los reportes')
      }

      return await response.json()
    } catch (err) {
      if (err instanceof TypeError && err.message.includes('fetch')) {
        throw new Error('No se pudo conectar con el servidor')
      }
      throw err
    }
  }

  async getById(id: number): Promise<Blob> {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null
      
      const headers: HeadersInit = {}
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }

      const response = await fetch(`${api}/reporte/${id}`, {
        method: 'GET',
        headers,
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || 'Error al cargar el reporte')
      }

      return await response.blob()
    } catch (err) {
      if (err instanceof TypeError && err.message.includes('fetch')) {
        throw new Error('No se pudo conectar con el servidor')
      }
      throw err
    }
  }

  async create(nombre: string, fechaInicio: Date, fechaFin: Date): Promise<ReporteResponse> {
    try {
      const response = await fetch(`${api}/reporte/create`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          nombre,
          fechaInicio: fechaInicio.toISOString(),
          fechaFin: fechaFin.toISOString(),
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || 'Error al crear el reporte')
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
      const response = await fetch(`${api}/reporte/${id}`, {
        method: 'DELETE',
        headers: this.getHeaders(),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || 'Error al eliminar el reporte')
      }

      return await response.json()
    } catch (err) {
      if (err instanceof TypeError && err.message.includes('fetch')) {
        throw new Error('No se pudo conectar con el servidor')
      }
      throw err
    }
  }

  async getDaily(menuId: number): Promise<Blob> {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null
      
      const headers: HeadersInit = {}
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }

      const response = await fetch(`${api}/reporte/dayly/${menuId}`, {
        method: 'GET',
        headers,
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || 'Error al cargar el reporte')
      }

      return await response.blob()
    } catch (err) {
      if (err instanceof TypeError && err.message.includes('fetch')) {
        throw new Error('No se pudo conectar con el servidor')
      }
      throw err
    }
  }
}

export const reporteService = new ReporteService()
