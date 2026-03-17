"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Loader2, Eye, Trash2, Plus, AlertTriangle } from "lucide-react"
import { reporteService, Reporte } from "@/lib/api/reportes"

export default function ReportesPage() {
  const [reportes, setReportes] = useState<Reporte[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const [nombre, setNombre] = useState("")
  const [fechaInicio, setFechaInicio] = useState("")
  const [fechaFin, setFechaFin] = useState("")

  useEffect(() => {
    loadReportes()
  }, [])

  const loadReportes = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await reporteService.getAll()
      setReportes(data)
    } catch (error) {
      setError('No se pudieron cargar los reportes')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!nombre.trim() || !fechaInicio || !fechaFin) return

    try {
      setIsSubmitting(true)
      setError(null)
      setSuccessMessage(null)

      await reporteService.create(
        nombre,
        new Date(fechaInicio),
        new Date(fechaFin)
      )

      setSuccessMessage('Reporte generado exitosamente')
      setTimeout(() => setSuccessMessage(null), 2000)
      await loadReportes()

      setNombre("")
      setFechaInicio("")
      setFechaFin("")
      setTimeout(() => setIsModalOpen(false), 100)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'No se pudo generar el reporte')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleView = async (id: number) => {
    try {
      const blob = await reporteService.getById(id)
      const url = window.URL.createObjectURL(blob)
      window.open(url, '_blank')
    } catch (error) {
      setError('No se pudo cargar el reporte')
    }
  }

  const handleDelete = (id: number) => {
    setDeleteId(id)
    setIsDeleteModalOpen(true)
  }

  const confirmDelete = async () => {
    if (!deleteId) return

    try {
      setError(null)
      await reporteService.delete(deleteId)
      await loadReportes()
      setDeleteId(null)
      setIsDeleteModalOpen(false)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'No se pudo eliminar el reporte')
    } finally {
      setIsDeleteModalOpen(false)
    }
  }

  const openAddModal = () => {
    setNombre("")
    const today = new Date().toISOString().split('T')[0]
    setFechaInicio(today)
    setFechaFin(today)
    setError(null)
    setSuccessMessage(null)
    setIsModalOpen(true)
  }

  const formatDate = (dateString: string | Date) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('es-ES', {
      timeZone: 'UTC',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reportes</h1>
          <p className="text-muted-foreground">
            Genera y gestiona reportes del sistema
          </p>
        </div>
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button onClick={openAddModal}>
              <Plus className="mr-2 h-4 w-4" />
              Nuevo Reporte
            </Button>
          </DialogTrigger>

          <DialogContent>
            <DialogHeader>
              <DialogTitle>Generar Nuevo Reporte</DialogTitle>
              <DialogDescription>
                Completa los datos del reporte por período
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 border border-red-200 bg-red-50 text-red-700 rounded-md text-sm">
                  {error}
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="nombre">Nombre del Reporte</Label>
                <Input
                  id="nombre"
                  type="text"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Ej: Reporte Enero 2024"
                  required
                  disabled={isSubmitting}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fechaInicio">Fecha de Inicio</Label>
                <Input
                  id="fechaInicio"
                  type="date"
                  value={fechaInicio}
                  onChange={(e) => setFechaInicio(e.target.value)}
                  required
                  disabled={isSubmitting}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fechaFin">Fecha Fin</Label>
                <Input
                  id="fechaFin"
                  type="date"
                  value={fechaFin}
                  onChange={(e) => setFechaFin(e.target.value)}
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
                      Generando
                    </>
                  ) : (
                    'Generar Reporte'
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
                ¿Estás seguro de que deseas eliminar este reporte? Esta acción no se puede deshacer.
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-end space-x-2 pt-4">
              <Button
                variant="outline"
                onClick={() => setIsDeleteModalOpen(false)}
              >
                Cancelar
              </Button>
              <Button
                variant="destructive"
                onClick={confirmDelete}
              >
                Eliminar
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
          <CardTitle>Lista de Reportes</CardTitle>
          <CardDescription>
            Reportes generados en el sistema
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
                  <TableHead>Fecha Inicio</TableHead>
                  <TableHead>Fecha Fin</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reportes.map((reporte, index) => (
                  <TableRow key={reporte.id}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell className="font-medium">{reporte.nombre}</TableCell>
                    <TableCell>{formatDate(reporte.fechaInicio)}</TableCell>
                    <TableCell>{formatDate(reporte.fechaFin)}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleView(reporte.id)}
                          title="Ver PDF"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(reporte.id)}
                          title="Eliminar"
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
          {!isLoading && reportes.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No hay reportes generados. Crea uno nuevo para comenzar.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
