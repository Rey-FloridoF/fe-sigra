"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Loader2, Eye, FileText } from "lucide-react"
import { reservaService, MenuWithReservations, ReservationsByMenu } from "@/lib/api/reservas"
import { reporteService } from "@/lib/api/reportes"

export default function ReservationsPage() {
  const [menus, setMenus] = useState<MenuWithReservations[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedMenu, setSelectedMenu] = useState<ReservationsByMenu | null>(null)
  const [selectedMenuId, setSelectedMenuId] = useState<number | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isLoadingDetails, setIsLoadingDetails] = useState(false)
  const [isLoadingPdf, setIsLoadingPdf] = useState(false)
  const [modalError, setModalError] = useState<string | null>(null)

  useEffect(() => {
    loadMenus()
  }, [])

  const loadMenus = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await reservaService.getAllMenusWithReservations()
      setMenus(data)
    } catch (error) {
      setError('No se pudieron cargar los menús')
    } finally {
      setIsLoading(false)
    }
  }

  const handleViewReservations = async (menuId: number) => {
    try {
      setIsLoadingDetails(true)
      setSelectedMenuId(menuId)
      const data = await reservaService.getReservationsByMenu(menuId)
      setSelectedMenu(data)
      setIsModalOpen(true)
    } catch (error) {
      setError('No se pudieron cargar las reservaciones')
    } finally {
      setIsLoadingDetails(false)
    }
  }

  const handleViewPdf = async () => {
    if (!selectedMenuId) return
    
    try {
      setModalError(null)
      setIsLoadingPdf(true)
      const blob = await reporteService.getDaily(selectedMenuId)
      const url = window.URL.createObjectURL(blob)
      window.open(url, '_blank')
    } catch (error) {
      setModalError('No se pudo cargar el reporte PDF')
    } finally {
      setIsLoadingPdf(false)
    }
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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Reservaciones</h1>
        <p className="text-muted-foreground">
          Ver todas las reservaciones por día
        </p>
      </div>

      {error && (
        <div className="mb-4 p-4 border border-red-200 bg-red-50 text-red-700 rounded-md">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {menus.map((menu) => (
            <Card key={menu.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">{formatDate(menu.fecha)}</CardTitle>
                <CardDescription>
                  {menu.cantidadReservaciones} reservación(es)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="text-sm">
                    <span className="font-medium">Opciones del menú:</span>
                    <ul className="mt-1 space-y-1">
                      {menu.opciones.map((opcion) => (
                        <li key={opcion.id} className="text-muted-foreground">
                          • {opcion.nombre}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <Button 
                    variant="outline" 
                    className="w-full mt-4"
                    onClick={() => handleViewReservations(menu.id)}
                    disabled={isLoadingDetails}
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    Ver Reservaciones
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {!isLoading && menus.length === 0 && (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            No hay menús publicados con reservaciones.
          </CardContent>
        </Card>
      )}

      <Dialog open={isModalOpen} onOpenChange={(open) => {
        setIsModalOpen(open)
        if (!open) {
          setSelectedMenu(null)
          setModalError(null)
        }
      }}>
        <DialogContent className="max-w-4xl w-[95vw] max-h-[85vh] overflow-y-auto sm:overflow-hidden">
          <DialogHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <DialogTitle className="text-lg sm:text-xl">
                  Reservaciones del {selectedMenu && formatDate(selectedMenu.fecha)}
                </DialogTitle>
                <DialogDescription className="text-sm">
                  Lista de empleados y sus reservaciones
                </DialogDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleViewPdf}
                disabled={isLoadingPdf}
              >
                {isLoadingPdf ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <FileText className="mr-2 h-4 w-4" />
                )}
                Ver PDF
              </Button>
            </div>
          </DialogHeader>
          
          {modalError && (
            <div className="mx-1 mb-4 p-3 border border-red-200 bg-red-50 text-red-700 rounded-md text-sm">
              {modalError}
            </div>
          )}
          
          {selectedMenu && (
            <div className="space-y-4">
              <div className="border rounded-md overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="min-w-[120px]">Empleado</TableHead>
                      {selectedMenu.opciones.map((opcion) => (
                        <TableHead key={opcion.id} className="text-center min-w-[80px]">
                          {opcion.nombre}
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedMenu.empleados.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={selectedMenu.opciones.length + 1} className="text-center text-muted-foreground">
                          No hay reservaciones para este día
                        </TableCell>
                      </TableRow>
                    ) : (
                      selectedMenu.empleados.map((empleado) => (
                        <TableRow key={empleado.id}>
                          <TableCell className="font-medium">{empleado.nombre}</TableCell>
                          {selectedMenu.opciones.map((opcion) => {
                            const cantidad = empleado.opciones[opcion.id] || 0
                            return (
                              <TableCell key={opcion.id} className="text-center">
                                {cantidad > 0 ? cantidad : '-'}
                              </TableCell>
                            )
                          })}
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              <div className="bg-muted/50 p-3 sm:p-4 rounded-md">
                <h4 className="font-medium mb-2 sm:mb-3 text-sm sm:text-base">Total por opción</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {selectedMenu.opciones.map((opcion) => (
                    <div key={opcion.id} className="text-sm">
                      <span className="font-medium">{opcion.nombre}:</span>{' '}
                      <span>{selectedMenu.totalPorOpcion[opcion.id] || 0}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
