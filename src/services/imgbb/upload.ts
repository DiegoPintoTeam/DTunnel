import { MultipartFile } from '@fastify/multipart';

export class Imgbb {
  static async upload(file: MultipartFile) {
    try {
      const pageResponse = await fetch('https://imgbb.com');
      const page = await pageResponse.text();
      const authToken = page.match(/auth_token="([^"]+)"/)?.[1];

      if (!authToken) {
        return { status: 502, message: 'No se pudo obtener autorización de ImgBB' };
      }

      const formData = new FormData();
      formData.append('source', new Blob([await file.toBuffer()], { type: file.mimetype }), file.filename);
      formData.append('type', 'file');
      formData.append('action', 'upload');
      formData.append('timestamp', String(Date.now()));
      formData.append('auth_token', authToken);

      const uploadResponse = await fetch('https://imgbb.com/json', {
        method: 'POST',
        body: formData,
      });

      const response = await uploadResponse.json();
      if (response.success && response.success.code == 200) {
        return { status: 200, url: response.image.display_url };
      }

      return { status: 400, message: response.error.message };
    } catch {
      return { status: 502, message: 'No se pudo subir la imagen a ImgBB' };
    }
  }
}
