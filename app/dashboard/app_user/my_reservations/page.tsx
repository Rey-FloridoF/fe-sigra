"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Loader2, Calendar, AlertCircle, Check, X, Pencil, Trash2, Eye } from "lucide-react"
import { reservaService, type ReservaWithPlatos } from "@/lib/api/reservas"
import { menuService, type MenuPlato } from "@/lib/api/menu"

interface OpcionSeleccionada {
  opcionId: number
  cantidad: number
  activo: boolean
  elegible: boolean
}

export default function MyReservationsPage() {
  const [reservas, setReservas] = useState<ReservaWithPlatos[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  
  const [selectedReserva, setSelectedReserva] = useState<ReservaWithPlatos | null>(null)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  
  const [editingReserva, setEditingReserva] = useState<ReservaWithPlatos | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [menuOpciones, setMenuOpciones] = useState<OpcionSeleccionada[]>([])
  const [isLoadingMenu, setIsLoadingMenu] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const [deleteReserva, setDeleteReserva] = useState<ReservaWithPlatos | null>(null)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)

  useEffect(() => {
    loadReservas()
  }, [])

  const loadReservas = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await reservaService.getAllByUser()
      setReservas(data)
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error al cargar las reservas"
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (dateStr: string) => {
    if (!dateStr) return ""
    const fecha = dateStr.split("T")[0]
    const [year, month, day] = fecha.split("-")
    const date = new Date(Number(year), Number(month) - 1, Number(day))
    return date.toLocaleDateString("es-ES", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const isReservaEditable = (fechaReserva: string) => {
    const fechaStr = fechaReserva.split("T")[0]
    const [year, month, day] = fechaStr.split("-")
    const fechaMenu = new Date(Number(year), Number(month) - 1, Number(day))
    const limiteReserva = new Date(fechaMenu)
    limiteReserva.setDate(limiteReserva.getDate() - 1)
    limiteReserva.setHours(18, 0, 0, 0)
    const now = new Date()
    return now < limiteReserva
  }

  const handleViewReserva = (reserva: ReservaWithPlatos) => {
    setSelectedReserva(reserva)
    setIsViewModalOpen(true)
  }

  const handleEditReserva = async (reserva: ReservaWithPlatos) => {
    try {
      setEditingReserva(reserva)
      setIsEditModalOpen(true)
      setIsLoadingMenu(true)
      setError(null)

      const fechaStr = reserva.fechaReserva.split("T")[0]
      const menuData = await menuService.getByFecha(fechaStr)

      if (!menuData) {
        setError("No se encontró el menú para esta fecha")
        return
      }

      const opcionesIniciales: OpcionSeleccionada[] = menuData.platos.map((plato) => {
        const platoReservado = reserva.platos.find(p => {
          const nombreNormalizado = (p.nombre || "").toLowerCase().trim()
          const nombrePlato = (plato.nombre || "").toLowerCase().trim()
          return nombreNormalizado === nombrePlato
        })
        
        return {
          opcionId: plato.id!,
          cantidad: platoReservado?.cantidad || 0,
          activo: !!platoReservado,
          elegible: plato.elegible,
        }
      })

      setMenuOpciones(opcionesIniciales)
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error al cargar el menú"
      setError(message)
    } finally {
      setIsLoadingMenu(false)
    }
  }

  const handleToggleActivo = (opcionId: number) => {
    setMenuOpciones((prev) =>
      prev.map((opt) =>
        opt.opcionId === opcionId && opt.elegible
          ? { ...opt, activo: !opt.activo, cantidad: !opt.activo ? 1 : 0 }
          : opt
      )
    )
  }

  const handleCantidadChange = (opcionId: number, cantidad: number) => {
    setMenuOpciones((prev) =>
      prev.map((opt) =>
        opt.opcionId === opcionId
          ? { ...opt, cantidad: Math.max(0, Math.min(cantidad, opt.elegible ? 2 : 1)) }
          : opt
      )
    )
  }

  const handleSubmitEdit = async () => {
    if (!editingReserva) return

    const platosParaReservar = menuOpciones
      .filter((opt) => opt.activo && opt.cantidad > 0)
      .map((opt) => ({
        opcionId: Number(opt.opcionId),
        cantidad: Number(opt.cantidad),
      }))

    if (platosParaReservar.length === 0) {
      setError("Debes seleccionar al menos una opción")
      return
    }

    try {
      setIsSubmitting(true)
      setError(null)

      const fechaStr = editingReserva.fechaReserva.split("T")[0]
      await reservaService.update(editingReserva.id, fechaStr, platosParaReservar)

      setSuccessMessage("Reserva actualizada exitosamente")
      setTimeout(() => setSuccessMessage(null), 2000)
      
      setIsEditModalOpen(false)
      loadReservas()
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error al actualizar la reserva"
      setError(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteReserva = (reserva: ReservaWithPlatos) => {
    setDeleteReserva(reserva)
    setIsDeleteModalOpen(true)
  }

  const confirmDelete = async () => {
    if (!deleteReserva) return

    try {
      setIsSubmitting(true)
      setError(null)

      await reservaService.delete(deleteReserva.id)

      setSuccessMessage("Reserva cancelada exitosamente")
      setTimeout(() => setSuccessMessage(null), 2000)
      
      setIsDeleteModalOpen(false)
      loadReservas()
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error al cancelar la reserva"
      setError(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const haySeleccion = () => {
    return menuOpciones.some(opt => opt.cantidad > 0)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Mis Reservas</h1>
        <p className="text-muted-foreground">Gestiona tus reservas de alimentos</p>
      </div>

      {error && (
        <div className="mb-4 p-4 border border-red-200 bg-red-50 text-red-700 rounded-md flex items-center gap-2">
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      )}

      {successMessage && (
        <div className="mb-4 p-4 border border-green-200 bg-green-50 text-green-700 rounded-md flex items-center gap-2">
          <Check className="h-4 w-4" />
          {successMessage}
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : reservas.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-lg font-medium">No tienes reservas</p>
            <p className="text-muted-foreground">
              Cuando hagas una reserva, aparecerá aquí
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {reservas.map((reserva) => {
            const editable = isReservaEditable(reserva.fechaReserva)
            return (
              <Card key={reserva.id} className={!editable ? "opacity-100" : ""}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    {formatDate(reserva.fechaReserva)}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="mb-4 text-sm text-muted-foreground">
                    {reserva.platos && reserva.platos.length > 0 ? (
                      <div className="flex flex-col gap-1">
                        <span>Tienes una reserva</span>
                        <span className="font-semibold text-foreground">
                          Total: ${reserva.precioTotal?.toFixed(2) || '0.00'}
                        </span>
                      </div>
                    ) : (
                      <span>Sin platos</span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewReserva(reserva)}
                      className="flex-1 disabled:opacity-100 disabled:pointer-events-auto"
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Ver
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditReserva(reserva)}
                      disabled={!editable}
                      className="flex-1"
                    >
                      <Pencil className="h-4 w-4 mr-1" />
                      Editar
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteReserva(reserva)}
                      disabled={!editable}
                      className="flex-1 text-red-500 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  {!editable && (
                    <p className="text-xs text-muted-foreground mt-2 text-center">
                      Tiempo agotado
                    </p>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Detalles de la Reserva</DialogTitle>
            <DialogDescription>
              {selectedReserva && formatDate(selectedReserva.fechaReserva)}
            </DialogDescription>
          </DialogHeader>
          <div className="overflow-y-auto overflow-x-auto max-h-[60vh]">
            <div className="space-y-3">
            {selectedReserva?.platos?.map((plato, idx) => (
              <div key={idx} className="flex justify-between items-center p-3 border rounded-lg">
                <div>
                  <p className="font-medium">{plato.nombre}</p>
                  {!plato.elegible && (
                    <span className="text-xs bg-orange-200 text-orange-800 px-2 py-0.5 rounded">
                      Obligatorio
                    </span>
                  )}
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold">x{plato.cantidad}</div>
                  <div className="text-sm text-muted-foreground">${plato.precio?.toFixed(2)}</div>
                </div>
              </div>
            ))}
            {selectedReserva && (
              <div className="flex justify-end pt-3 border-t">
                <span className="text-lg font-bold">
                  Total: ${selectedReserva.precioTotal?.toFixed(2) || '0.00'}
                </span>
              </div>
            )}
          </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Reserva</DialogTitle>
            <DialogDescription>
              {editingReserva && formatDate(editingReserva.fechaReserva)}
            </DialogDescription>
          </DialogHeader>
          {isLoadingMenu ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : (
            <>
              {error && (
                <div className="p-3 border border-red-200 bg-red-50 text-red-700 rounded-md text-sm">
                  {error}
                </div>
              )}
              <div className="space-y-4">
                {menuOpciones.map((opcion) => {
                  const plato = editingReserva?.platos?.find(p => {
                    const nombreNormalizado = (p.nombre || "").toLowerCase().trim()
                    const nombrePlato = (menuOpciones.find(m => m.opcionId === opcion.opcionId)?.elegible ? "elegible" : "") 
                    return true
                  })
                  return (
                    <div
                      key={opcion.opcionId}
                      className={`p-4 border rounded-lg ${
                        opcion.elegible
                          ? opcion.activo
                            ? "border-green-500 bg-green-50"
                            : "border-gray-200"
                          : "border-orange-300 bg-orange-50"
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium">
                              {editingReserva?.platos?.find((p, idx) => idx === menuOpciones.indexOf(opcion))?.nombre || `Opción ${opcion.opcionId}`}
                            </h3>
                            {!opcion.elegible && (
                              <span className="text-xs bg-orange-200 text-orange-800 px-2 py-0.5 rounded">
                                Obligatorio
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <Label className="text-sm">Activo</Label>
                            <button
                              type="button"
                              onClick={() => handleToggleActivo(opcion.opcionId)}
                              disabled={!opcion.elegible}
                              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                opcion.activo ? "bg-green-600" : "bg-gray-300"
                              } ${!opcion.elegible ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                            >
                              <span
                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                  opcion.activo ? "translate-x-6" : "translate-x-1"
                                }`}
                              />
                            </button>
                          </div>

                          <div className="flex items-center gap-2">
                            <Label className="text-sm">Cantidad</Label>
                            <div className="flex items-center gap-1">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleCantidadChange(opcion.opcionId, opcion.cantidad - 1)}
                                disabled={opcion.cantidad <= (opcion.elegible ? 0 : 1)}
                              >
                                -
                              </Button>
                              <input
                                type="number"
                                value={opcion.cantidad}
                                onChange={(e) =>
                                  handleCantidadChange(opcion.opcionId, parseInt(e.target.value) || 0)
                                }
                                className="w-12 h-8 text-center border rounded"
                                min={opcion.elegible ? 0 : 1}
                                max={opcion.elegible ? 2 : 1}
                                disabled={!opcion.elegible}
                              />
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleCantidadChange(opcion.opcionId, opcion.cantidad + 1)}
                                disabled={opcion.cantidad >= (opcion.elegible ? 2 : 1) || !opcion.activo}
                              >
                                +
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

              <div className="flex justify-end gap-2 mt-4">
                <Button
                  variant="outline"
                  onClick={() => setIsEditModalOpen(false)}
                  disabled={isSubmitting}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleSubmitEdit}
                  disabled={isSubmitting || !haySeleccion()}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    "Guardar Cambios"
                  )}
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              Cancelar Reserva
            </DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas cancelar esta reserva? Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 mt-4">
            <Button
              variant="outline"
              onClick={() => setIsDeleteModalOpen(false)}
              disabled={isSubmitting}
            >
              No, mantener reserva
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={isSubmitting}
              className="text-black-500 hover:text-red-700 hover:bg-red-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Cancelando...
                </>
              ) : (
                "Sí, cancelar reserva"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
