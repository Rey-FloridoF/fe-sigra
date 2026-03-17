const api = process.env.NEXT_PUBLIC_API_URL

export interface MenuPlato {
  id?: number
  platoId?: number
  nombre?: string
  precio?: number
  elegible: boolean
}

export interface Menu {
  id: number
  fecha: string
  publicado: boolean
}

export interface MenuWithPlatos {
  id: number
  fecha: string
  publicado: boolean
  platos: MenuPlato[]
}

interface Plato {
  id: number
  nombre: string
  descripcion: string
  precio: number
}

class MenuService {
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

  async getAll(): Promise<Menu[]> {
    const response = await fetch(`${api}/menu`, {
      method: 'GET',
      headers: this.getHeaders(),
    })

    if (!response.ok) {
      throw new Error('Error al cargar los menús')
    }

    return await response.json()
  }

  async getById(id: string): Promise<MenuWithPlatos> {
    const response = await fetch(`${api}/menu/${id}`, {
      method: 'GET',
      headers: this.getHeaders(),
    })

    if (!response.ok) {
      throw new Error('Error al cargar el menú')
    }

    return await response.json()
  }

  async create(menu: { fecha: string; menuPlatos: MenuPlato[] }): Promise<{ message: string }> {
    const response = await fetch(`${api}/menu/create`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({
        fecha: new Date(menu.fecha),
        menuPlatos: menu.menuPlatos,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || 'Error al crear el menú')
    }

    return await response.json()
  }

  async update(id: string, menu: { fecha: string; menuPlatos: MenuPlato[] }): Promise<{ message: string }> {
    const response = await fetch(`${api}/menu/update/${id}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify({
        fecha: new Date(menu.fecha),
        menuPlatos: menu.menuPlatos,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || 'Error al actualizar el menú')
    }

    return await response.json()
  }

  async delete(id: string): Promise<{ message: string }> {
    const response = await fetch(`${api}/menu/destroy/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || 'Error al eliminar el menú')
    }

    return await response.json()
  }

  async publicar(id: string): Promise<{ message: string }> {
    const response = await fetch(`${api}/menu/publish/${id}`, {
      method: 'PATCH',
      headers: this.getHeaders(),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || 'Error al publicar el menú')
    }

    return await response.json()
  }

  async getByFecha(fecha: string): Promise<MenuWithPlatos | null> {
    try {
      const response = await fetch(`${api}/menu/forFecha/${fecha}`, {
        method: 'GET',
        headers: this.getHeaders(),
      })

      if (response.status === 404) {
        return null
      }

      if (!response.ok) {
        throw new Error('Error al cargar el menú')
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
export const menuService = new MenuService()
