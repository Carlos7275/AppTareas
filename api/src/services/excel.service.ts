import * as path from 'path';
import * as fs from 'fs';
import * as ExcelJS from 'exceljs';
import { Logger } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';

type Coordenadas = { row: number; col: number };

export class ExcelService {
  private readonly logger = new Logger(ExcelService.name);

  private isAsyncIterable(obj: any): obj is AsyncIterable<any> {
    return obj && typeof obj[Symbol.asyncIterator] === 'function';
  }

  private async escribirArrayDeDatos(
    wb: ExcelJS.Workbook,
    sheet: ExcelJS.Worksheet,
    value: any,
    posiciones: Coordenadas | Coordenadas[],
    mapping: string[],
    batchSize: number
  ) {
    let filaActual = Array.isArray(posiciones) ? posiciones[0].row : posiciones.row;
    let hojaIndex = 1;
    const nombreBase = sheet.name;

    let batch: any[] = [];
    let totalProcesados = 0;
    const { total } = (await value[Symbol.asyncIterator]().next()).value;
    const startTime = Date.now();

    const escribirBatch = (lote: any[]) => {
      const primeraFila = Array.isArray(posiciones) ? posiciones[0].row : posiciones.row;

      for (const data of lote) {
        if (filaActual > 1_048_576) {
          hojaIndex++;
          const nuevaHoja = wb.addWorksheet(`${nombreBase} (${hojaIndex})`);

          sheet.eachRow({ includeEmpty: true }, (rowTemplate, rowNumber) => {
            if (rowNumber < primeraFila) {
              const rowNew = nuevaHoja.getRow(rowNumber);
              rowTemplate.eachCell({ includeEmpty: true }, (cellTemplate, colNumber) => {
                rowNew.getCell(colNumber).value = cellTemplate.value;
                if (cellTemplate.style) rowNew.getCell(colNumber).style = { ...cellTemplate.style };
              });
            }
          });
          filaActual = primeraFila;
          sheet = nuevaHoja;
        }

        const row = sheet.getRow(filaActual);


        const rowTemplate = sheet.getRow(primeraFila);
        if (Array.isArray(posiciones)) {
          posiciones.forEach((pos, j) => {
            const valor = data?.[mapping[j]];
            const cell = row.getCell(pos.col);
            if (valor !== undefined) cell.value = typeof valor === 'boolean' ? (valor ? 'Sí' : 'No') : valor;


            const templateCell = rowTemplate.getCell(pos.col);
            if (templateCell.style) cell.style = { ...templateCell.style };
          });
        } else {
          const valor = data?.[mapping[0]];
          const cell = row.getCell(posiciones.col);
          if (valor !== undefined) cell.value = typeof valor === 'boolean' ? (valor ? 'Sí' : 'No') : valor;


          const templateCell = rowTemplate.getCell(posiciones.col);
          if (templateCell.style) cell.style = { ...templateCell.style };
        }

        filaActual++;
        totalProcesados++;
      }


      const duracion = ((Date.now() - startTime) / 1000).toFixed(2);
      const restante = total ? total - totalProcesados : 'desconocido';
      this.logger.log(
        `Procesados: ${totalProcesados}${total ? '/' + total : ''} | Restantes: ${restante} | Tiempo transcurrido: ${duracion}s`
      );
    };


    if (this.isAsyncIterable(value)) {
      for await (const item of value) {
        batch.push(item.valor ?? item);
        if (batch.length >= batchSize) {
          escribirBatch(batch);
          batch = [];
        }
      }
    } else if (Array.isArray(value) || (value && typeof value[Symbol.iterator] === 'function')) {
      for (const item of value) {
        batch.push(item.valor ?? item);
        if (batch.length >= batchSize) {
          escribirBatch(batch);
          batch = [];
        }
      }
    } else {
      throw new Error('El valor proporcionado no es iterable ni async iterable');
    }

    if (batch.length) escribirBatch(batch);
  }

  async generarReporte(
    ruta: string,
    datos: Record<string, any>,
    posiciones: Record<string, Coordenadas | Coordenadas[]>,
    arrayKeys: string[] = [],
    mapeo: Record<string, string[]> = {},
    batchSize: number = 100_000
  ): Promise<string> {
    this.logger.log(`Iniciando generación de reporte con plantilla: ${ruta}.xlsx`);

    const fecha = new Date().toISOString().replace(/[:.]/g, '-');
    const uuid = uuidv4();
    const outputPath = path.join(process.cwd(), 'public', 'reports', `${ruta}-${uuid}-${fecha}.xlsx`);

    const dir = path.dirname(outputPath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    const templatePath = path.join(process.cwd(), 'public', 'templates', `${ruta}.xlsx`);
    const wb = new ExcelJS.Workbook();
    await wb.xlsx.readFile(templatePath);
    const ws = wb.worksheets[0];

    this.logger.log(`Plantilla cargada: ${ws.name}`);

    for (const key of Object.keys(datos)) {
      if (arrayKeys.includes(key)) continue;
      const pos = posiciones[key] as Coordenadas;
      if (pos && datos[key] !== undefined) {
        const row = ws.getRow(pos.row);
        row.getCell(pos.col).value = datos[key];
      }
    }

    for (const key of arrayKeys) {
      const value = datos[key];

      if (!value) continue;

      const mapping = mapeo[key];
      if (!mapping) throw new Error(`No se encontró mapeo para key "${key}"`);

      this.logger.log(`Escribiendo array grande: ${key}`);
      await this.escribirArrayDeDatos(wb, ws, value, posiciones[key], mapping, batchSize);
    }

    await wb.xlsx.writeFile(outputPath);
    return outputPath;
  }
}
