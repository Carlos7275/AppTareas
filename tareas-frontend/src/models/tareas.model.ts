export interface Tareas {
   id: number
  created: string
  updated: string
  nombre: string
  descripcion: string
  prioridad: string
  id_usuario: number
  fecha_inicio: any
  fecha_fin: any
  fecha_terminado: any
  completado: boolean
  expirando:boolean
  estadoCompletado:string;
}