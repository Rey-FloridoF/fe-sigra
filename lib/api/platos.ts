const api = process.env.NEXT_PUBLIC_API_URL

interface Plato {
  id?: string
  nombre: string
  descripcion: string
  precio: number
  createdAt?: string
}

class PlatoService {
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

  async getAll(): Promise<Plato[]> {
    try {
      const response = await fetch(`${api}/plato`, {
        method: 'GET',
        headers: this.getHeaders(),
      })

      if (!response.ok) {
        if (response.status === 401) {
          if (typeof window !== 'undefined') {
            localStorage.removeItem('authToken')
            window.location.href = '/auth'
          }
        }
        throw new Error(`Error fetching platos: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Error in getAll:', error)
      throw error
    }
  }

  async getById(id: string): Promise<Plato> {
    try {
      const response = await fetch(`${api}/plato/${id}`, {
        method: 'GET',
        headers: this.getHeaders(),
      })

      if (!response.ok) {
        if (response.status === 401) {
          if (typeof window !== 'undefined') {
            localStorage.removeItem('authToken')
            window.location.href = '/auth'
          }
        }
        throw new Error(`Error fetching plato: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Error in getById:', error)
      throw error
    }
  }

  async create(plato: { nombre: string; descripcion: string; precio: number }): Promise<Plato> {
    try {
      const response = await fetch(`${api}/plato/create`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(plato),
      })

      if (!response.ok) {
        if (response.status === 401) {
          if (typeof window !== 'undefined') {
            localStorage.removeItem('authToken')
            window.location.href = '/auth'
          }
        }
        throw new Error(`Error creating plato: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Error in create:', error)
      throw error
    }
  }

  async update(id: string, plato: { nombre: string; descripcion: string; precio: number }): Promise<Plato> {
    try {
      const response = await fetch(`${api}/plato/update/${id}`, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify(plato),
      })

      if (!response.ok) {
        if (response.status === 401) {
          if (typeof window !== 'undefined') {
            localStorage.removeItem('authToken')
            window.location.href = '/auth'
          }
        }
        throw new Error(`Error updating plato: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Error in update:', error)
      throw error
    }
  }

  async delete(id: string): Promise<void> {
    try {
      const response = await fetch(`${api}/plato/destroy/${id}`, {
        method: 'DELETE',
        headers: this.getHeaders(),
      })

      if (!response.ok) {
        if (response.status === 401) {
          if (typeof window !== 'undefined') {
            localStorage.removeItem('authToken')
            window.location.href = '/auth'
          }
        }
        throw new Error(`Error deleting plato: ${response.statusText}`)
      }
    } catch (error) {
      console.error('Error in delete:', error)
      throw error
    }
  }
}

export const platoService = new PlatoService()
export type { Plato }
