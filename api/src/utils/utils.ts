import * as path from 'path';

export class Utils {
  static Response(
    message: string,
    data?: any,
    search?: string ,
    total?: number,
  ) {
    return { message, search, data, total };
  }
  static isValidBase64(str) {
    const base64ImageRegex =
      /^data:image\/(jpeg|png|gif|bmp|webp);base64,(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/;

    return base64ImageRegex.test(str);
  }

  static getRelativePath(pathFile: string) {
    const splitted = pathFile.split("/");

    const rutaRelativa = path.join(__dirname, `../../${splitted[1]}/${splitted[2]}/${splitted[3]}/${splitted[4]}`)
    return rutaRelativa;
  }
}
