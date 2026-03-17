"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, DollarSign, Calendar, BarChart3, X } from "lucide-react"
import { estadisticasService } from "@/lib/api/estadisticas"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"

interface GastoMes {
  mes: number
  anio: number
  mesNombre: string
  gasto: number
}

interface GastoTotal {
  gasto: number
  cantidadReservas: number
}

interface GastoPorMes {
  anio: number
  meses: {
    mes: number
    mesNombre: string
    gasto: number
  }[]
}

export default function HistorialPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [gastoMes, setGastoMes] = useState<GastoMes | null>(null)
  const [gastoTotal, setGastoTotal] = useState<GastoTotal | null>(null)
  const [gastoPorMes, setGastoPorMes] = useState<GastoPorMes | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedMes, setSelectedMes] = useState<number>(new Date().getMonth() + 1)
  const [selectedAnio, setSelectedAnio] = useState<number>(new Date().getFullYear())
  const [gastoMesEspecifico, setGastoMesEspecifico] = useState<GastoMes | null>(null)
  const [loadingModal, setLoadingModal] = useState(false)

  useEffect(() => {
    loadHistorial()
  }, [])

  const loadHistorial = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const [gastoMesData, gastoTotalData, gastoPorMesData] = await Promise.all([
        estadisticasService.getGastoMesActual(),
        estadisticasService.getGastoTotal(),
        estadisticasService.getGastoPorMes(new Date().getFullYear()),
      ])

      setGastoMes(gastoMesData)
      setGastoTotal(gastoTotalData)
      setGastoPorMes(gastoPorMesData)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar historial")
    } finally {
      setLoading(false)
    }
  }

  const handleOpenModal = () => {
    setSelectedMes(new Date().getMonth() + 1)
    setSelectedAnio(new Date().getFullYear())
    loadGastoMesEspecifico(new Date().getFullYear())
    setModalOpen(true)
  }

  const loadGastoMesEspecifico = async (anio: number) => {
    setLoadingModal(true)
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/estadisticas/historial/gasto-por-mes?anio=${anio}`,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('authToken')}`,
          },
        }
      )
      const data = await res.json()
      const mesData = data.meses.find((m: { mes: number }) => m.mes === selectedMes)
      setGastoMesEspecifico({
        mes: selectedMes,
        anio: anio,
        mesNombre: mesData?.mesNombre || '',
        gasto: mesData?.gasto || 0,
      })
      
      if (gastoPorMes?.anio !== anio) {
        const gastoPorMesData = await estadisticasService.getGastoPorMes(anio)
        setGastoPorMes(gastoPorMesData)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar datos")
    } finally {
      setLoadingModal(false)
    }
  }

  const maxGasto = gastoPorMes?.meses.length
    ? Math.max(...gastoPorMes.meses.map(m => m.gasto))
    : 1

  const meses = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ]

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="p-4 border border-red-200 bg-red-50 text-red-700 rounded-md">
          {error}
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Historial</h1>
        <p className="text-muted-foreground">Visualiza tus gastos en reservas</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Gasto del Mes Actual
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${gastoMes?.gasto?.toFixed(2) || '0.00'}
            </div>
            <p className="text-xs text-muted-foreground">
              {gastoMes?.mesNombre} {gastoMes?.anio}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Gasto Total
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${gastoTotal?.gasto?.toFixed(2) || '0.00'}
            </div>
            <p className="text-xs text-muted-foreground">
              {gastoTotal?.cantidadReservas || 0} reservas realizadas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Detalles Gastos
            </CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <Button onClick={handleOpenModal} className="w-full">
              Ver Detalles
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Gastos por Mes - {gastoPorMes?.anio}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {gastoPorMes?.meses.map((mes) => (
            <div key={mes.mes} className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>{mes.mesNombre}</span>
                <span className="font-medium">${mes.gasto.toFixed(2)}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full"
                  style={{ width: `${maxGasto > 0 ? (mes.gasto / maxGasto) * 100 : 0}%` }}
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalles de Gastos por Mes</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">
                    Promedio de Gasto por Reserva
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    ${gastoTotal && gastoTotal.cantidadReservas > 0 
                      ? (gastoTotal.gasto / gastoTotal.cantidadReservas).toFixed(2) 
                      : '0.00'}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Basado en {gastoTotal?.cantidadReservas || 0} reservas
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">
                    Mes con Más Gastos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {gastoPorMes?.meses.reduce((max, mes) => 
                      mes.gasto > max.gasto ? mes : max, gastoPorMes.meses[0])?.mesNombre || 'N/A'} {gastoPorMes?.anio}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    ${gastoPorMes?.meses.reduce((max, mes) => 
                      mes.gasto > max.gasto ? mes : max, gastoPorMes.meses[0])?.gasto.toFixed(2) || '0.00'}
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
