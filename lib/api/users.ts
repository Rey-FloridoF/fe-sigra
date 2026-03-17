const api = process.env.NEXT_PUBLIC_API_URL

interface User {
  id?: string
  nombre: string
  apellidoPat: string
  apellidoMat: string
  username: string
  password?: string
  role: string
  departamentoId: string
  departamento: string
  createdAt?: string
}

class UserService {
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

  async getAll(): Promise<User[]> {
    try {
      const response = await fetch(`${api}/users`, {
        method: 'GET',
        headers: this.getHeaders(),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || 'Error al cargar usuarios')
      }

      return await response.json()
    } catch (err) {
      if (err instanceof TypeError && err.message.includes('fetch')) {
        throw new Error('No se pudo conectar con el servidor')
      }
      throw err
    }
  }

  async create(user: {
    nombre: string
    apellidoPat: string
    apellidoMat: string
    username: string
    password: string
    role: string
    departamentoId: number
  }): Promise<User> {
    const response = await fetch(`${api}/users/create`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(user),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || 'Error al crear usuario')
    }

    return await response.json()
  }

  async update(id: string, user: {
    nombre: string
    apellidoPat: string
    apellidoMat: string
    username: string
    departamentoId: number
  }): Promise<User> {
    try {
      const url = `${api}/users/update/${id}`
      const response = await fetch(url, {
        method: 'PATCH',
        headers: this.getHeaders(),
        body: JSON.stringify(user),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `Error al actualizar usuario (${response.status})`)
      }

      return await response.json()
    } catch (err) {
      if (err instanceof TypeError && err.message.includes('fetch')) {
        throw new Error('No se pudo conectar con el servidor')
      }
      throw err
    }
  }

  async delete(id: string): Promise<void> {
    const response = await fetch(`${api}/users/destroy/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || 'Error al eliminar usuario')
    }
  }

  async getById(id: string): Promise<User> {
    try {
      const response = await fetch(`${api}/users/${id}`, {
        method: 'GET',
        headers: this.getHeaders(),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `Error al obtener usuario (${response.status})`)
      }

      return await response.json()
    } catch (err) {
      if (err instanceof TypeError && err.message.includes('fetch')) {
        throw new Error('No se pudo conectar con el servidor')
      }
      throw err
    }
  }

  async changePassword(id: string, data: { newPassword: string; confirmNewPassword: string }): Promise<string> {
    try {
      const response = await fetch(`${api}/users/changepass/${id}`, {
        method: 'PATCH',
        headers: this.getHeaders(),
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || 'Error al cambiar contraseña')
      }

      const result = await response.json().catch(() => ({}))
      return result.message || 'Contraseña cambiada correctamente'
    } catch (err) {
      if (err instanceof TypeError && err.message.includes('fetch')) {
        throw new Error('No se pudo conectar con el servidor')
      }
      throw err
    }
  }
}

export const userService = new UserService()
export type { User }
