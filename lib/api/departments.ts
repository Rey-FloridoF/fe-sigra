const api = process.env.NEXT_PUBLIC_API_URL

interface Department {
  id?: string
  nombre: string
  createdAt?: string
}

class DepartmentService {
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

  async getAll(): Promise<Department[]> {
    try {
      const response = await fetch(`${api}/departamento`, {
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
        throw new Error(`Error fetching departments: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Error in getAll:', error)
      throw error
    }
  }

  async getById(id: string): Promise<Department> {
    try {
      const response = await fetch(`${api}/departamento/${id}`, {
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
        throw new Error(`Error fetching department: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Error in getById:', error)
      throw error
    }
  }

  async create(department: { nombre: string }): Promise<Department> {
    try {
      const response = await fetch(`${api}/departamento/create`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(department),
      })

      if (!response.ok) {
        if (response.status === 401) {
          if (typeof window !== 'undefined') {
            localStorage.removeItem('authToken')
            window.location.href = '/auth'
          }
        }
        throw new Error(`Error creating department: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Error in create:', error)
      throw error
    }
  }

  async update(id: string, department: { nombre: string }): Promise<Department> {
    try {
      const response = await fetch(`${api}/departamento/update/${id}`, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify(department),
      })

      if (!response.ok) {
        if (response.status === 401) {
          if (typeof window !== 'undefined') {
            localStorage.removeItem('authToken')
            window.location.href = '/auth'
          }
        }
        throw new Error(`Error updating department: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Error in update:', error)
      throw error
    }
  }

  async delete(id: string): Promise<void> {
    try {
      const response = await fetch(`${api}/departamento/destroy/${id}`, {
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
        throw new Error(`Error deleting department: ${response.statusText}`)
      }
    } catch (error) {
      console.error('Error in delete:', error)
      throw error
    }
  }
}

export const departmentService = new DepartmentService()
export type { Department }