"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Combobox } from "@/components/ui/combobox"
import { Pencil, Plus, Trash2, Loader2, AlertTriangle, Eye, Send, CheckCircle, XCircle } from "lucide-react"
import { menuService, Menu, MenuWithPlatos } from "@/lib/api/menu"
import { platoService, Plato } from "@/lib/api/platos"

interface MenuPlatoOption {
  id: number
  platoId: string
  elegible: boolean
}

export default function MenuPage() {
  const [menus, setMenus] = useState<Menu[]>([])
  const [platos, setPlatos] = useState<Plato[]>([])
  const [menuPlatos, setMenuPlatos] = useState<MenuPlatoOption[]>([])
  const [editingMenu, setEditingMenu] = useState<MenuWithPlatos | null>(null)
  const [menuDate, setMenuDate] = useState("")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [viewMenu, setViewMenu] = useState<MenuWithPlatos | null>(null)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [publishId, setPublishId] = useState<string | null>(null)
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false)

  useEffect(() => {
    loadMenus()
    loadPlatos()
  }, [])

  const loadMenus = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await menuService.getAll()
      setMenus(data)
    } catch (error) {
      setError('No se pudieron cargar los menús')
    } finally {
      setIsLoading(false)
    }
  }

  const loadPlatos = async () => {
    try {
      const data = await platoService.getAll()
      setPlatos(data)
    } catch (error) {
      console.error('Error al cargar platos:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!menuDate.trim() || menuPlatos.length === 0) return

    const menuPlatosPayload = menuPlatos.map(mp => ({
      platoId: parseInt(mp.platoId),
      elegible: mp.elegible,
    }))

    try {
      setIsSubmitting(true)
      setError(null)

      if (editingMenu) {
        await menuService.update(editingMenu.id.toString(), {
          fecha: menuDate,
          menuPlatos: menuPlatosPayload
        })
      } else {
        await menuService.create({
          fecha: menuDate,
          menuPlatos: menuPlatosPayload
        })
      }

      await loadMenus()

      setSuccessMessage(editingMenu ? 'Menú actualizado exitosamente' : 'Menú creado exitosamente')
      setTimeout(() => setSuccessMessage(null), 2000)

      setMenuDate("")
      setMenuPlatos([])
      setEditingMenu(null)
      setTimeout(() => setIsModalOpen(false), 100)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'No se pudo guardar el menú')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEdit = async (menu: Menu) => {
    try {
      const menuData = await menuService.getById(menu.id.toString())
      setEditingMenu(menuData)
      setMenuDate(menuData.fecha.split('T')[0])
      setMenuPlatos(menuData.platos.map((p: any, idx) => ({
        id: idx,
        platoId: p.platoId?.toString() || p.id_plato?.toString() || '',
        elegible: p.elegible,
      })))
      setIsModalOpen(true)
    } catch (error) {
      setError('No se pudo cargar el menú')
    }
  }

  const handleDelete = (id: string) => {
    setDeleteId(id)
    setIsDeleteModalOpen(true)
  }

  const confirmDelete = async () => {
    if (!deleteId) return

    try {
      setError(null)
      await menuService.delete(deleteId)

      await loadMenus()

      setSuccessMessage('Menú eliminado exitosamente')
      setTimeout(() => setSuccessMessage(null), 2000)

      setDeleteId(null)
      setTimeout(() => setIsDeleteModalOpen(false), 100)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'No se pudo eliminar el menú')
    } finally {
      setIsDeleteModalOpen(false)
    }
  }

  const handlePublicar = (id: string) => {
    setPublishId(id)
    setIsPublishModalOpen(true)
  }

  const handleView = async (menu: Menu) => {
    try {
      const menuData = await menuService.getById(menu.id.toString())
      setViewMenu(menuData)
      setIsViewModalOpen(true)
    } catch (error) {
      setError('No se pudo cargar el menú')
    }
  }

  const handlePublish = (id: string) => {
    setPublishId(id)
    setIsPublishModalOpen(true)
  }

  const confirmPublish = async () => {
    if (!publishId) return

    try {
      setError(null)
      await menuService.publicar(publishId)
      await loadMenus()
      setPublishId(null)
      setIsPublishModalOpen(false)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'No se pudo publicar el menú')
    } finally {
      setIsPublishModalOpen(false)
    }
  }

  const openAddModal = () => {
    setEditingMenu(null)
    const today = new Date().toISOString().split('T')[0]
    setMenuDate(today)
    setMenuPlatos([])
    setError(null)
    setIsModalOpen(true)
  }

  const addPlatoOption = () => {
    const newId = menuPlatos.length > 0 ? Math.max(...menuPlatos.map(mp => mp.id)) + 1 : 0
    setMenuPlatos([...menuPlatos, { id: newId, platoId: "", elegible: true }])
  }

  const removePlatoOption = (id: number) => {
    setMenuPlatos(menuPlatos.filter(mp => mp.id !== id))
  }

  const updatePlatoOption = (id: number, field: 'platoId' | 'elegible', value: string | boolean) => {
    setMenuPlatos(menuPlatos.map(mp =>
      mp.id === id ? { ...mp, [field]: value } : mp
    ))
  }

  const formatDate = (dateString: string) => {
    const datePart = dateString.split('T')[0]
    const [year, month, day] = datePart.split('-').map(Number)
    const date = new Date(year, month - 1, day)
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const platoOptions = platos.map(p => ({
    value: p.id?.toString() || "",
    label: `${p.nombre} - $${p.precio}`
  }))

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Menús</h1>
          <p className="text-muted-foreground">
            Gestiona los menús del sistema
          </p>
        </div>
        <Dialog open={isModalOpen} onOpenChange={(open) => {
          if (!open) {
            setIsModalOpen(false)
            setEditingMenu(null)
            setMenuDate("")
            setMenuPlatos([])
          } else if (!editingMenu) {
            const today = new Date().toISOString().split('T')[0]
            setMenuDate(today)
            setMenuPlatos([])
          }
        }}>
          <DialogTrigger asChild>
            <Button onClick={openAddModal}>
              <Plus className="mr-2 h-4 w-4" />
              Agregar Menú
            </Button>
          </DialogTrigger>

          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingMenu ? "Editar Menú" : "Agregar Nuevo Menú"}
              </DialogTitle>
              <DialogDescription>
                {editingMenu
                  ? "Modifica los datos del menú seleccionado."
                  : "Completa el formulario para crear un nuevo menú."
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
                <Label htmlFor="date">Fecha del Menú</Label>
                <Input
                  id="date"
                  type="date"
                  value={menuDate}
                  onChange={(e) => setMenuDate(e.target.value)}
                  required
                  disabled={isSubmitting || editingMenu?.publicado}
                />
              </div>
              <div className="space-y-2">
                <Label>Platos del Menú</Label>
                <div className="space-y-2 border rounded-md p-4">
                  {menuPlatos.map((menuPlato, index) => (
                    <div key={menuPlato.id} className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground w-6">{index + 1}.</span>
                      <div className="flex-1">
                        <Combobox
                          options={platoOptions}
                          value={menuPlato.platoId}
                          onValueChange={(value) => updatePlatoOption(menuPlato.id, 'platoId', value)}
                          placeholder="Seleccionar plato..."
                          disabled={isSubmitting}
                        />
                      </div>
                      <label className="flex items-center gap-2 text-sm cursor-pointer">
                        <input
                          type="checkbox"
                          checked={menuPlato.elegible}
                          onChange={(e) => updatePlatoOption(menuPlato.id, 'elegible', e.target.checked)}
                          disabled={isSubmitting}
                          className="w-4 h-4"
                        />
                        Elegible
                      </label>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removePlatoOption(menuPlato.id)}
                        disabled={isSubmitting}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  {menuPlatos.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-2">
                      Agrega al menos un plato al menú
                    </p>
                  )}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addPlatoOption}
                    disabled={isSubmitting}
                    className="w-full mt-2"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Agregar Plato
                  </Button>
                </div>
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
                <Button type="submit" disabled={isSubmitting || menuPlatos.length === 0 || menuPlatos.some(mp => !mp.platoId)}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {editingMenu ? "Actualizando" : "Guardando"}
                    </>
                  ) : (
                    <>
                      {editingMenu ? "Actualizar" : "Guardar"}
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
                ¿Estás seguro de que deseas eliminar este menú? Esta acción no se puede deshacer.
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

        <Dialog open={isPublishModalOpen} onOpenChange={setIsPublishModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Send className="h-5 w-5 text-blue-500" />
                Confirmar Publicación
              </DialogTitle>
              <DialogDescription>
                ¿Estás seguro de que deseas publicar este menú? Una vez publicado, <strong>no podrás editarlo ni eliminarlo</strong>.
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-end space-x-2 pt-4">
              <Button
                variant="outline"
                onClick={() => setIsPublishModalOpen(false)}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button
                variant="default"
                onClick={confirmPublish}
                disabled={isSubmitting}
                className="bg-orange-500 hover:bg-orange-600"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Publicando
                  </>
                ) : (
                  <>
                    Publicar
                  </>
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Detalles del Menú</DialogTitle>
              <DialogDescription>
                {viewMenu && formatDate(viewMenu.fecha)}
              </DialogDescription>
            </DialogHeader>
            {viewMenu && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <span className="font-medium">Estado:</span>
                  {viewMenu.publicado ? (
                    <span className="flex items-center gap-1 text-green-600">
                      <CheckCircle className="h-4 w-4" />Publicado
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-yellow-600">
                      <XCircle className="h-4 w-4" />No publicado
                    </span>
                  )}
                </div>
                <div>
                  <h4 className="font-medium mb-2">Platos del Menú</h4>
                  <div className="border rounded-md">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Plato</TableHead>
                          <TableHead>Precio</TableHead>
                          <TableHead>Elegible</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {viewMenu.platos.map((plato, idx) => (
                          <TableRow key={idx}>
                            <TableCell>{plato.nombre}</TableCell>
                            <TableCell>${plato.precio}</TableCell>
                            <TableCell>
                              {plato.elegible ? (
                                <span className="text-green-600">Sí</span>
                              ) : (
                                <span className="text-gray-400">No</span>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </div>
            )}
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
          <CardTitle>Lista de Menús</CardTitle>
          <CardDescription>
            Menús registrados en el sistema
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
                  <TableHead>Fecha</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {menus.map((menu, index) => (
                  <TableRow key={menu.id}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell className="font-medium">{formatDate(menu.fecha)}</TableCell>
                    <TableCell>
                      {menu.publicado ? (
                        <span className="flex items-center gap-1 text-green-600">
                          <CheckCircle className="h-4 w-4" />Publicado
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-yellow-600">
                          <XCircle className="h-4 w-4" />No publicado
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleView(menu)}
                          title="Ver"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {!menu.publicado && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(menu)}
                              disabled={isLoading}
                              title="Editar"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDelete(menu.id.toString())}
                              disabled={isLoading}
                              title="Eliminar"
                              className="text-red-500 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                        {menu.publicado && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              disabled
                              title="Editar (deshabilitado)"
                              className="opacity-50 cursor-not-allowed"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              disabled
                              title="Eliminar (deshabilitado)"
                              className="opacity-50 cursor-not-allowed"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                        {!menu.publicado && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePublicar(menu.id.toString())}
                            title="Publicar"
                          >
                            <Send className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
          {!isLoading && menus.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No hay menús registrados. Agrega uno nuevo para comenzar.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
