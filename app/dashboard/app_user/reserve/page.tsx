"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog"
import { Loader2, Calendar, AlertCircle, Check, X, Info } from "lucide-react"
import { menuService, type MenuPlato } from "@/lib/api/menu"
import { reservaService, type ReservaPlato } from "@/lib/api/reservas"

interface OpcionSeleccionada {
  opcionId: number
  cantidad: number
  activo: boolean
  elegible: boolean
}

export default function ReservePage() {
  const [selectedDate, setSelectedDate] = useState<string>("")
  const [menu, setMenu] = useState<{ fecha: string; publicado: boolean; platos: MenuPlato[] } | null>(null)
  const [opciones, setOpciones] = useState<OpcionSeleccionada[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [isMenuAnterior, setIsMenuAnterior] = useState(false)

  useEffect(() => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    const dateStr = tomorrow.toISOString().split("T")[0]
    setSelectedDate(dateStr)
  }, [])

  useEffect(() => {
    if (selectedDate) {
      loadMenu(selectedDate)
    }
  }, [selectedDate])

  const loadMenu = async (fecha: string) => {
    try {
      setIsLoading(true)
      setError(null)
      setSuccessMessage(null)

      const menuData = await menuService.getByFecha(fecha)

      if (!menuData) {
        setMenu(null)
        setOpciones([])
        return
      }

      setMenu(menuData)

      const opcionesIniciales: OpcionSeleccionada[] = menuData.platos.map((plato) => ({
        opcionId: plato.id!,
        cantidad: plato.elegible ? 0 : 1,
        activo: !plato.elegible,
        elegible: plato.elegible,
      }))

      setOpciones(opcionesIniciales)

      const fechaStr = menuData.fecha.split("T")[0]
      const [year, month, day] = fechaStr.split("-")
      const fechaMenu = new Date(Number(year), Number(month) - 1, Number(day))

      const limiteReserva = new Date(fechaMenu)
      limiteReserva.setDate(limiteReserva.getDate() - 1)
      limiteReserva.setHours(23, 0, 0, 0)

      const now = new Date()
      setIsMenuAnterior(now > limiteReserva)
    } catch (err) {
      setMenu(null)
      setOpciones([])
      const message = err instanceof Error ? err.message : "Error al cargar el menú"
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleToggleActivo = (opcionId: number) => {
    setOpciones((prev) =>
      prev.map((opt) =>
        opt.opcionId === opcionId && opt.elegible
          ? { ...opt, activo: !opt.activo, cantidad: !opt.activo ? 1 : 0 }
          : opt
      )
    )
  }

  const handleCantidadChange = (opcionId: number, cantidad: number) => {
    setOpciones((prev) =>
      prev.map((opt) =>
        opt.opcionId === opcionId
          ? { ...opt, cantidad: Math.max(0, Math.min(cantidad, opt.elegible ? 2 : 1)) }
          : opt
      )
    )
  }

  const handleSubmit = async () => {
    if (!selectedDate || !menu) return

    const platosParaReservar: ReservaPlato[] = opciones
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
      setSuccessMessage(null)

      await reservaService.create(selectedDate, platosParaReservar)

      setSuccessMessage("Reserva realizada exitosamente")
      setOpciones([])
      setMenu(null)

      setTimeout(() => {
        loadMenu(selectedDate)
      }, 2000)

      setTimeout(() => setSuccessMessage(null), 2000)
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error al realizar la reserva"
      setError(message)
    } finally {
      setIsSubmitting(false)
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

  const isToday = (dateStr: string) => {
    const today = new Date()
    const [year, month, day] = dateStr.split("-")
    const selected = new Date(Number(year), Number(month) - 1, Number(day))

    return (
      selected.getFullYear() === today.getFullYear() &&
      selected.getMonth() === today.getMonth() &&
      selected.getDate() === today.getDate()
    )
  }

  const haySeleccion = () => {
    return opciones.some(opt => opt.cantidad > 0)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Reservar</h1>
        <p className="text-muted-foreground">Selecciona el día y los platos que deseas reservar</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Seleccionar Fecha
            </CardTitle>

            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="icon">
                  <Info className="h-4 w-4" />
                </Button>
              </DialogTrigger>

              <DialogContent>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2 text-black"><Info className="h-4 w-4" />Información importante</DialogTitle>
                </DialogHeader>

                <ul className="list-disc pl-5 space-y-2 text-sm">
                  <li>
                    Si el plato es <span className="text-xs bg-orange-200 text-orange-800 px-2 py-0.5 rounded">Obligatorio</span> no puede ni quitarlo de su elección, ni seleccionar la cantidad.
                  </li>
                  <li>
                    La cantidad de un mismo plato no puede exceder en 2.
                  </li>
                  <li>
                    Una vez hecha la reserva puede editarla o cancelarla antes de las 23:00 del día anterior a la fecha de la reserva.
                  </li>
                </ul>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
            <div className="space-y-2 w-full sm:w-auto">
              <Label htmlFor="fecha">Fecha del menú</Label>
              <Input
                id="fecha"
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                min={new Date().toISOString().split("T")[0]}
                className="w-full sm:w-64"
              />
            </div>
            <div className="text-sm text-muted-foreground pb-2">
              {selectedDate && formatDate(selectedDate)}
              {isToday(selectedDate) && (
                <span className="ml-2 text-orange-600 font-medium">(Hoy)</span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="mt-6">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : !menu ? (
          <Card>
            <CardContent className="py-12 text-center">
              <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg font-medium">No hay menú publicado</p>
              <p className="text-muted-foreground">
                No existe un menú publicado para la fecha seleccionada
              </p>
            </CardContent>
          </Card>
        ) : isMenuAnterior ? (
          <Card>
            <CardHeader>
              <CardTitle>Menú del {formatDate(menu.fecha)}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-6 p-4 border border-amber-200 bg-amber-50 rounded-lg">
                <div className="flex items-start gap-3">
                  <X className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-amber-800">Tiempo agotado</p>
                    <p className="text-sm text-amber-700 mt-1">
                      No es posible realizar reservas para esta fecha. El límite es antes de las 23:00 del día anterior.
                    </p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                {opciones.map((opcion) => {
                  const plato = menu.platos.find((p) => p.id === opcion.opcionId)
                  if (!plato) return null

                  return (
                    <div
                      key={opcion.opcionId}
                      className={`p-4 border rounded-lg ${opcion.elegible
                        ? opcion.activo
                          ? "border-green-500 bg-green-50"
                          : "border-gray-200"
                        : "border-orange-300 bg-orange-50"
                        } opacity-60`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium">{plato.nombre}</h3>
                            {!opcion.elegible && (
                              <span className="text-xs bg-orange-200 text-orange-800 px-2 py-0.5 rounded">
                                Obligatorio
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">${plato.precio}</p>
                        </div>

                        {/* Controles: se apilan en móvil, fila en escritorio */}
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 w-full sm:w-auto">
                          {/* Toggle Activo */}
                          <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-start">
                            <Label className="text-sm">Activo</Label>
                            <button
                              type="button"
                              disabled
                              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${opcion.activo ? "bg-green-600" : "bg-gray-300"
                                } opacity-50 cursor-not-allowed`}
                            >
                              <span
                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${opcion.activo ? "translate-x-6" : "translate-x-1"
                                  }`}
                              />
                            </button>
                          </div>

                          {/* Selector Cantidad */}
                          <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-start">
                            <Label className="text-sm">Cantidad</Label>
                            <div className="flex items-center gap-1">
                              <Button
                                variant="outline"
                                size="sm"
                                disabled
                                className="opacity-50"
                              >
                                -
                              </Button>
                              <Input
                                type="number"
                                value={opcion.cantidad}
                                className="w-16 h-8 text-center"
                                disabled
                              />
                              <Button
                                variant="outline"
                                size="sm"
                                disabled
                                className="opacity-50"
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
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Menú del {formatDate(menu.fecha)}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {opciones.map((opcion) => {
                  const plato = menu.platos.find((p) => p.id === opcion.opcionId)
                  if (!plato) return null

                  return (
                    <div
                      key={opcion.opcionId}
                      className={`p-4 border rounded-lg ${opcion.elegible
                        ? opcion.activo
                          ? "border-green-500 bg-green-50"
                          : "border-gray-200"
                        : "border-orange-300 bg-orange-50"
                        }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium">{plato.nombre}</h3>
                            {!opcion.elegible && (
                              <span className="text-xs bg-orange-200 text-orange-800 px-2 py-0.5 rounded">
                                Obligatorio
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">${plato.precio}</p>
                        </div>

                        {/* Controles: se apilan en móvil, fila en escritorio */}
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 w-full sm:w-auto">
                          {/* Toggle Activo */}
                          <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-start">
                            <Label className="text-sm">Activo</Label>
                            <button
                              type="button"
                              onClick={() => handleToggleActivo(opcion.opcionId)}
                              disabled={!opcion.elegible}
                              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${opcion.activo ? "bg-green-600" : "bg-gray-300"
                                } ${!opcion.elegible ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                            >
                              <span
                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${opcion.activo ? "translate-x-6" : "translate-x-1"
                                  }`}
                              />
                            </button>
                          </div>

                          {/* Selector Cantidad */}
                          <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-start">
                            <Label className="text-sm">Cantidad</Label>
                            <div className="flex items-center gap-1">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleCantidadChange(opcion.opcionId, opcion.cantidad - 1)}
                                disabled={opcion.cantidad <= (opcion.elegible ? 0 : 1) || !opcion.activo}
                              >
                                -
                              </Button>
                              <Input
                                type="number"
                                value={opcion.cantidad}
                                onChange={(e) =>
                                  handleCantidadChange(opcion.opcionId, parseInt(e.target.value) || 0)
                                }
                                className="w-16 h-8 text-center"
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

              {error && (
                <div className="mt-4 mb-4 p-4 border border-red-200 bg-red-50 text-red-700 rounded-md flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  {error}
                </div>
              )}

              <div className="mt-6 flex justify-end">
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting || !haySeleccion()}
                  size="lg"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Reservando...
                    </>
                  ) : (
                    "Confirmar Reserva"
                  )}
                </Button>
              </div>
            </CardContent>

          </Card>
        )}
      </div>

      {successMessage && (
        <div className="mt-4 mb-4 p-4 border border-green-200 bg-green-50 text-green-700 rounded-md flex items-center gap-2">
          <Check className="h-4 w-4" />
          {successMessage}
        </div>
      )}
    </div>
  )
}