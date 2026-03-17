"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Pencil, Plus, Trash2, Loader2, AlertTriangle } from "lucide-react"
import { platoService, Plato } from "@/lib/api/platos"

export default function PlatosPage() {
  const [platos, setPlatos] = useState<Plato[]>([])
  const [nombre, setNombre] = useState("")
  const [descripcion, setDescripcion] = useState("")
  const [precio, setPrecio] = useState("")
  const [editingPlato, setEditingPlato] = useState<Plato | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)

  useEffect(() => {
    loadPlatos()
  }, [])

  const loadPlatos = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await platoService.getAll()
      setPlatos(data)
    } catch (error) {
      setError('No se pudieron cargar los platos')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!nombre.trim() || !descripcion.trim() || !precio) return

    try {
      setIsSubmitting(true)
      setError(null)

      const platoData = {
        nombre,
        descripcion,
        precio: Number(precio)
      }

      if (editingPlato) {
        await platoService.update(editingPlato.id!, platoData)
      } else {
        await platoService.create(platoData)
      }

      await loadPlatos()

      setSuccessMessage(editingPlato ? 'Plato actualizado exitosamente' : 'Plato creado exitosamente')
      setTimeout(() => setSuccessMessage(null), 2000)

      setNombre("")
      setDescripcion("")
      setPrecio("")
      setEditingPlato(null)
      setTimeout(() => setIsModalOpen(false), 100)
    } catch (error) {
      setError('No se pudo guardar el plato')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEdit = async (plato: Plato) => {
    try {
      const platoData = await platoService.getById(plato.id!)
      setEditingPlato(platoData)
      setNombre(platoData.nombre)
      setDescripcion(platoData.descripcion)
      setPrecio(platoData.precio.toString())
      setIsModalOpen(true)
    } catch (error) {
      setError('No se pudo cargar el plato')
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
      await platoService.delete(deleteId)

      await loadPlatos()

      setSuccessMessage('Plato eliminado exitosamente')
      setTimeout(() => setSuccessMessage(null), 2000)

      setDeleteId(null)
      setTimeout(() => setIsDeleteModalOpen(false), 100)
    } catch (error) {
      setError('No se pudo eliminar el plato')
    } finally {
      setIsDeleteModalOpen(false)
    }
  }

  const openAddModal = () => {
    setEditingPlato(null)
    setNombre("")
    setDescripcion("")
    setPrecio("")
    setError(null)
    setIsModalOpen(true)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Platos</h1>
          <p className="text-muted-foreground">
            Gestiona los platos del sistema
          </p>
        </div>
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button onClick={openAddModal}>
              <Plus className="mr-2 h-4 w-4" />
              Agregar Plato
            </Button>
          </DialogTrigger>

          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingPlato ? "Editar Plato" : "Agregar Nuevo Plato"}
              </DialogTitle>
              <DialogDescription>
                {editingPlato
                  ? "Modifica los datos del plato seleccionado."
                  : "Completa el formulario para crear un nuevo plato."
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
                <Label htmlFor="nombre">Nombre del Plato</Label>
                <Input
                  id="nombre"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Ej: Paella Valenciana"
                  required
                  disabled={isSubmitting}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="descripcion">Descripción</Label>
                <Input
                  id="descripcion"
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  placeholder="Ej: Arroz con mariscos y especias"
                  required
                  disabled={isSubmitting}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="precio">Precio</Label>
                <Input
                  id="precio"
                  type="number"
                  min="1"
                  step="0.01"
                  value={precio}
                  onChange={(e) => setPrecio(e.target.value)}
                  placeholder="Ej: 15.50"
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
                      {editingPlato ? "Actualizando" : "Guardando"}
                    </>
                  ) : (
                    <>
                      {editingPlato ? "Actualizar" : "Guardar"}
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
                ¿Estás seguro de que deseas eliminar este plato? Esta acción no se puede deshacer.
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
          <CardTitle>Lista de Platos</CardTitle>
          <CardDescription>
            Platos registrados en el sistema
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
                  <TableHead>Descripción</TableHead>
                  <TableHead>Precio</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {platos.map((plato, index) => (
                  <TableRow key={plato.id}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell className="font-medium">{plato.nombre}</TableCell>
                    <TableCell>{plato.descripcion}</TableCell>
                    <TableCell>${plato.precio.toFixed(2)}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(plato)}
                          disabled={isLoading}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(plato.id!)}
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
          {!isLoading && platos.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No hay platos registrados. Agrega uno nuevo para comenzar.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
