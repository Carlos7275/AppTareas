import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { BadRequestException } from '@nestjs/common';

export class Image {
  /**
   * Carpeta raíz donde se guardan las imágenes
   */
  static baseFolder = path.join(process.cwd(), 'public', 'images');

  /**
   * Valida si un string es un Base64 válido
   */
  static isValidBase64(str: string): boolean {
    try {
      const regex = /^data:image\/(png|jpeg|jpg|gif|webp);base64,[A-Za-z0-9+/=]+$/;
      return regex.test(str);
    } catch {
      return false;
    }
  }

  /**
   * Guarda una imagen Base64 en la carpeta indicada
   * @param folder Carpeta dentro de images
   * @param imageBase64 Imagen en Base64
   * @returns URL pública de la imagen
   */
  static saveImage(folder: string, imageBase64: string): string {
    if (!this.isValidBase64(imageBase64))
      throw new BadRequestException('Ingrese una Imagen Válida');

    const matches = imageBase64.split(';');
    const imageFormat = matches[0].split(':')[1].split('/')[1];
    const base64 = matches[1].split(',');
    const imageBuffer = Buffer.from(base64[1], 'base64');

    const folderPath = path.join(this.baseFolder, folder);
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
    }

    const imageName = `${uuidv4()}.${imageFormat}`;
    const imagePath = path.join(folderPath, imageName);

    fs.writeFileSync(imagePath, imageBuffer);

    return `/public/images/${folder}/${imageName}`;
  }

  /**
   * Elimina un archivo de la carpeta public
   * @param filePath Ruta pública (ej: /public/images/folder/file.png)
   */
  static deleteFile(filePath: string) {
    const absolutePath = path.join(process.cwd(), filePath.replace(/^\/+/g, ''));
    if (fs.existsSync(absolutePath)) {
      fs.unlinkSync(absolutePath);
    }
  }

  /**
   * Listar imágenes de una carpeta
   * @param folder Carpeta dentro de images
   * @returns Array de URLs públicas
   */
  static listImages(folder: string): string[] {
    const folderPath = path.join(this.baseFolder, folder);
    if (!fs.existsSync(folderPath)) return [];

    return fs.readdirSync(folderPath).map(file => `/public/images/${folder}/${file}`);
  }
}
