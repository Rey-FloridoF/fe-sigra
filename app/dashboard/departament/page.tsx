"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Pencil, Plus, Trash2, Loader2, AlertTriangle } from "lucide-react"
import { departmentService, type Department } from "@/lib/api/departments"

export default function DepartamentsPage() {
  const [departments, setDepartments] = useState<Department[]>([])
  const [departmentName, setDepartmentName] = useState("")
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)

  useEffect(() => {
    loadDepartments()
  }, [])

  const loadDepartments = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await departmentService.getAll()
      setDepartments(data)
    } catch (error) {
      setError('No se pudieron cargar los departamentos')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!departmentName.trim()) return

    try {
      setIsSubmitting(true)
      setError(null)

      if (editingDepartment) {
        await departmentService.update(editingDepartment.id!, { nombre: departmentName })
      } else {
        await departmentService.create({ nombre: departmentName })
      }

      // Recargar la lista después de guardar
      await loadDepartments()

      setSuccessMessage(editingDepartment ? 'Departamento actualizado exitosamente' : 'Departamento creado exitosamente')
      setTimeout(() => setSuccessMessage(null), 2000)

      setDepartmentName("")
      setEditingDepartment(null)
      setTimeout(() => setIsModalOpen(false), 100)
    } catch (error) {
      setError('No se pudo guardar el departamento')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEdit = async (department: Department) => {
    try {
      const deptData = await departmentService.getById(department.id!)
      setEditingDepartment(deptData)
      setDepartmentName(deptData.nombre)
      setIsModalOpen(true)
    } catch (error) {
      setError('No se pudo cargar el departamento')
    }
  }

  const handleDelete = async (id: string) => {
    setDeleteId(id)
    setIsDeleteModalOpen(true)
  }

  const confirmDelete = async () => {
    if (!deleteId) return

    try {
      setError(null)
      await departmentService.delete(deleteId)

      await loadDepartments()

      setSuccessMessage('Departamento eliminado exitosamente')
      setTimeout(() => setSuccessMessage(null), 2000)

      setDeleteId(null)
      setTimeout(() => setIsDeleteModalOpen(false), 100)
    } catch (error) {
      setError('No se pudo eliminar el departamento')
    } finally { setIsDeleteModalOpen(false) }
  }

  const openAddModal = () => {
    setEditingDepartment(null)
    setDepartmentName("")
    setError(null)
    setIsModalOpen(true)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Departamentos</h1>
          <p className="text-muted-foreground">
            Gestiona los departamentos del sistema
          </p>
        </div>
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button onClick={openAddModal}>
              <Plus className="mr-2 h-4 w-4" />
              Agregar Departamento
            </Button>
          </DialogTrigger>

          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingDepartment ? "Editar Departamento" : "Agregar Nuevo Departamento"}
              </DialogTitle>
              <DialogDescription>
                {editingDepartment
                  ? "Modifica el nombre del departamento seleccionado."
                  : "Completa el formulario para crear un nuevo departamento."
                }
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 border border-red-200 bg-red-50 text-red-700 rounded-md text-sm">
                  {error}
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="name">Nombre del Departamento</Label>
                <Input
                  id="name"
                  value={departmentName}
                  onChange={(e) => setDepartmentName(e.target.value)}
                  placeholder="Ej: Recursos Humanos"
                  required
                  disabled={isSubmitting}
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsModalOpen(false)}
                  disabled={isSubmitting}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {editingDepartment ? "Actualizando" : "Guardando"}
                    </>
                  ) : (
                    <>
                      {editingDepartment ? "Actualizar" : "Guardar"}
                    </>
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Modal de confirmación de eliminación */}
        <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                Confirmar Eliminación
              </DialogTitle>
              <DialogDescription>
                ¿Estás seguro de que deseas eliminar este departamento? Esta acción no se puede deshacer.
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-end space-x-2 pt-4">
              <Button
                variant="outline"
                onClick={() => setIsDeleteModalOpen(false)}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button
                variant="destructive"
                onClick={confirmDelete}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Eliminando
                  </>
                ) : (
                  <>
                    Eliminar
                  </>
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {error && (
        <div className="mb-4 p-4 border border-red-200 bg-red-50 text-red-700 rounded-md">
          {error}
        </div>
      )}

      {successMessage && (
        <div className="mb-4 p-4 border border-green-200 bg-green-50 text-green-700 rounded-md">
          {successMessage}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Lista de Departamentos</CardTitle>
          <CardDescription>
            Departamentos registrados en el sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>#</TableHead>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {departments.map((department, index) => (
                  <TableRow key={department.id}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell className="font-medium">{department.nombre}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(department)}
                          disabled={isLoading}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(department.id!)}
                          disabled={isLoading}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
          {!isLoading && departments.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No hay departamentos registrados. Agrega uno nuevo para comenzar.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}