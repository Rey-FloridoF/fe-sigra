"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input, PasswordInput } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Pencil, Plus, Trash2, Loader2, AlertTriangle, Key } from "lucide-react"
import { userService, type User } from "@/lib/api/users"
import { departmentService, type Department } from "@/lib/api/departments-select"

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [departments, setDepartments] = useState<Department[]>([])
  const [formData, setFormData] = useState({
    nombre: "",
    apellidoPat: "",
    apellidoMat: "",
    username: "",
    password: "",
    role: "USUARIO",
    departamentoId: ""
  })
  const [passwordData, setPasswordData] = useState({
    newPassword: "",
    confirmNewPassword: ""
  })
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [userForPassword, setUserForPassword] = useState<User | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const [usersData, departmentsData] = await Promise.all([
        userService.getAll(),
        departmentService.getAll()
      ])
      setUsers(usersData)
      setDepartments(departmentsData)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'No se pudieron cargar los datos'
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.nombre.trim() || !formData.apellidoPat.trim() ||
      !formData.username.trim() || !formData.departamentoId) return

    try {
      setIsSubmitting(true)
      setError(null)

      if (editingUser) {
        await userService.update(editingUser.id!, {
          nombre: formData.nombre,
          apellidoPat: formData.apellidoPat,
          apellidoMat: formData.apellidoMat,
          username: formData.username,
          departamentoId: Number(formData.departamentoId)
        })
      } else {
        await userService.create({
          nombre: formData.nombre,
          apellidoPat: formData.apellidoPat,
          apellidoMat: formData.apellidoMat,
          username: formData.username,
          password: formData.password,
          role: formData.role,
          departamentoId: Number(formData.departamentoId)
        })
      }

      await loadData()

      resetForm()
      setIsModalOpen(false)

      setSuccessMessage(editingUser ? 'Usuario actualizado exitosamente' : 'Usuario creado exitosamente')
      setTimeout(() => setSuccessMessage(null), 2000)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'No se pudo guardar el usuario'
      setError(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEdit = async (user: User) => {
    try {
      const userData = await userService.getById(user.id!)
      setEditingUser(userData)
      setFormData({
        nombre: userData.nombre,
        apellidoPat: userData.apellidoPat,
        apellidoMat: userData.apellidoMat || "",
        username: userData.username,
        password: "",
        role: userData.role,
        departamentoId: userData.departamentoId?.toString() || ""
      })
      setIsModalOpen(true)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'No se pudo cargar el usuario'
      setError(message)
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
      await userService.delete(deleteId)

      await loadData()

      setDeleteId(null)
      setIsDeleteModalOpen(false)

      setSuccessMessage('Usuario eliminado exitosamente')
      setTimeout(() => setSuccessMessage(null), 2000)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'No se pudo eliminar el usuario'
      setError(message)
      setIsDeleteModalOpen(false)
    }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!userForPassword || !passwordData.newPassword || !passwordData.confirmNewPassword) return

    if (passwordData.newPassword !== passwordData.confirmNewPassword) {
      setError('Las contraseñas no coinciden')
      return
    }

    try {
      setIsSubmitting(true)
      setError(null)
      setSuccessMessage(null)

      const message = await userService.changePassword(userForPassword.id!, {
        newPassword: passwordData.newPassword,
        confirmNewPassword: passwordData.confirmNewPassword
      })

      setSuccessMessage(message)
      setPasswordData({ newPassword: "", confirmNewPassword: "" })
      setIsPasswordModalOpen(false)
      setUserForPassword(null)

      setTimeout(() => {
        setSuccessMessage(null)
      }, 2000)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'No se pudo cambiar la contraseña'
      setError(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const openPasswordModal = (user: User) => {
    setUserForPassword(user)
    setPasswordData({ newPassword: "", confirmNewPassword: "" })
    setError(null)
    setSuccessMessage(null)
    setIsPasswordModalOpen(true)
  }

  const handlePasswordModalOpenChange = (open: boolean) => {
    if (!open) {
      setIsPasswordModalOpen(false)
      setUserForPassword(null)
      setPasswordData({ newPassword: "", confirmNewPassword: "" })
    } else {
      setIsPasswordModalOpen(true)
    }
  }

  const resetForm = () => {
    setFormData({
      nombre: "",
      apellidoPat: "",
      apellidoMat: "",
      username: "",
      password: "",
      role: "USUARIO",
      departamentoId: ""
    })
    setEditingUser(null)
    setError(null)
  }

  const openAddModal = () => {
    resetForm()
    setIsModalOpen(true)
  }

  const handleModalOpenChange = (open: boolean) => {
    if (!open) {
      setIsModalOpen(false)
      resetForm()
    } else if (!editingUser) {
      resetForm()
      setIsModalOpen(true)
    } else {
      setIsModalOpen(true)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Usuarios</h1>
          <p className="text-muted-foreground">
            Gestiona los usuarios del sistema
          </p>
        </div>
        <Dialog open={isModalOpen} onOpenChange={handleModalOpenChange}>
          <DialogTrigger asChild>
            <Button onClick={openAddModal}>
              <Plus className="mr-2 h-4 w-4" />
              Agregar Usuario
            </Button>
          </DialogTrigger>

          <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingUser ? "Editar Usuario" : "Agregar Nuevo Usuario"}
              </DialogTitle>
              <DialogDescription>
                {editingUser
                  ? "Modifica los datos del usuario seleccionado."
                  : "Completa el formulario para crear un nuevo usuario."
                }
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 border border-red-200 bg-red-50 text-red-700 rounded-md text-sm">
                  {error}
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="departamento">Departamento</Label>
                  <select
                    id="departamento"
                    value={formData.departamentoId}
                    onChange={(e) => setFormData({ ...formData, departamentoId: e.target.value })}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    required
                    disabled={isSubmitting}
                  >
                    <option value="">Seleccionar departamento</option>
                    {departments.map((dept) => (
                      <option key={dept.id} value={dept.id}>
                        {dept.nombre}
                      </option>
                    ))}
                  </select>
                </div>
                {!editingUser && (
                  <div className="space-y-2">
                    <Label htmlFor="role">Rol</Label>
                    <select
                      id="role"
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      disabled={isSubmitting}
                    >
                      <option value="USUARIO">USUARIO</option>
                      <option value="ADMIN">ADMIN</option>
                    </select>
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="nombre">Nombre</Label>
                  <Input
                    id="nombre"
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    placeholder="Ej: Juan"
                    required
                    disabled={isSubmitting}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="apellidoPat">Primer Apellido</Label>
                  <Input
                    id="apellidoPat"
                    value={formData.apellidoPat}
                    onChange={(e) => setFormData({ ...formData, apellidoPat: e.target.value })}
                    placeholder="Ej: Pérez"
                    required
                    disabled={isSubmitting}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="apellidoMat">Segundo Apellido</Label>
                  <Input
                    id="apellidoMat"
                    value={formData.apellidoMat}
                    onChange={(e) => setFormData({ ...formData, apellidoMat: e.target.value })}
                    placeholder="Ej: García"
                    disabled={isSubmitting}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="username">Usuario</Label>
                  <Input
                    id="username"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    placeholder="Ej: jperez"
                    required
                    disabled={isSubmitting}
                  />
                </div>
                {!editingUser && (
                  <div className="space-y-2">
                    <Label htmlFor="password">Contraseña</Label>
                    <PasswordInput
                      id="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder="Ej: Password123"
                      required
                      disabled={isSubmitting}
                    />
                  </div>
                )}
              </div>
              <div className="flex justify-end space-x-2 pt-4">
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
                      {editingUser ? "Actualizando" : "Guardando"}
                    </>
                  ) : (
                    <>
                      {editingUser ? "Actualizar" : "Guardar"}
                    </>
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                Confirmar Eliminación
              </DialogTitle>
              <DialogDescription>
                ¿Estás seguro de que deseas eliminar este usuario? Esta acción no se puede deshacer.
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

        <Dialog open={isPasswordModalOpen} onOpenChange={handlePasswordModalOpenChange}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Cambiar Contraseña</DialogTitle>
              <DialogDescription>
                Ingresa la nueva contraseña para el usuario {userForPassword?.username}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleChangePassword} className="space-y-4">
              {error && (
                <div className="p-3 border border-red-200 bg-red-50 text-red-700 rounded-md text-sm">
                  {error}
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="newPassword">Nueva Contraseña</Label>
                <PasswordInput
                  id="newPassword"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  placeholder="Ej: nuevaPassword123"
                  required
                  disabled={isSubmitting}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmNewPassword">Confirmar Contraseña</Label>
                <PasswordInput
                  id="confirmNewPassword"
                  value={passwordData.confirmNewPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmNewPassword: e.target.value })}
                  placeholder="Ej: nuevaPassword123"
                  required
                  disabled={isSubmitting}
                />
              </div>
              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsPasswordModalOpen(false)}
                  disabled={isSubmitting}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Cambiando
                    </>
                  ) : (
                    "Cambiar Contraseña"
                  )}
                </Button>
              </div>
            </form>
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
          <CardTitle>Lista de Usuarios</CardTitle>
          <CardDescription>
            Usuarios registrados en el sistema
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
                  <TableHead>Primer Apellido</TableHead>
                  <TableHead>Segundo Apellido</TableHead>
                  <TableHead>Usuario</TableHead>
                  <TableHead>Departamento</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user, index) => (
                  <TableRow key={user.id}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell className="font-medium">{user.nombre}</TableCell>
                    <TableCell>{user.apellidoPat || '-'}</TableCell>
                    <TableCell>{user.apellidoMat || '-'}</TableCell>
                    <TableCell>{user.username}</TableCell>
                    <TableCell>{user.departamento}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(user)}
                          disabled={isLoading}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openPasswordModal(user)}
                          disabled={isLoading}
                        >
                          <Key className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(user.id!)}
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
          {!isLoading && users.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No hay usuarios registrados. Agrega uno nuevo para comenzar.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
