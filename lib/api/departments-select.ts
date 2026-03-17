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
    const response = await fetch(`${api}/departamento`, {
      method: 'GET',
      headers: this.getHeaders(),
    })

    if (!response.ok) {
      throw new Error('Error al cargar departamentos')
    }

    return await response.json()
  }
}

export const departmentService = new DepartmentService()
export type { Department }
