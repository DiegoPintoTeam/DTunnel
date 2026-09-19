import { ZodError } from 'zod';

const fieldTranslations: { [key: string]: string } = {
  username: 'El usuario',
  password: 'La contraseña',
  confirm_password: 'La confirmación de contraseña',
  email: 'El correo electrónico',
  name: 'El nombre',
  color: 'El color',
  status: 'El estado',
  sorter: 'El orden',
  package_id: 'El paquete',
  id: 'El ID',
  label: 'La etiqueta',
};

export default function ZodErrorHandler(error: ZodError) {
  const issue = error.issues[0];
  if (!issue) throw new Error('Datos no válidos');

  const fieldKey = (issue.path[issue.path.length - 1] as string) || '';
  const fieldLabel = fieldTranslations[fieldKey] || (fieldKey ? `El campo ${fieldKey}` : 'El campo');

  if (issue.message && !issue.message.includes('String must contain') && !issue.message.includes('Expected') && !issue.message.includes('Invalid')) {
    throw new Error(issue.message);
  }

  if (issue.code === 'too_small') {
    if (fieldKey === 'password') {
      throw new Error(`La contraseña debe tener al menos ${issue.minimum} caracteres`);
    }
    if (fieldKey === 'username') {
      throw new Error(`El usuario debe tener al menos ${issue.minimum} caracteres`);
    }
    throw new Error(`${fieldLabel} debe contener al menos ${issue.minimum} caracteres`);
  }

  if (issue.code === 'too_big') {
    if (fieldKey === 'password') {
      throw new Error(`La contraseña no debe superar los ${issue.maximum} caracteres`);
    }
    if (fieldKey === 'username') {
      throw new Error(`El usuario no debe superar los ${issue.maximum} caracteres`);
    }
    throw new Error(`${fieldLabel} no puede superar los ${issue.maximum} caracteres`);
  }

  if (issue.code === 'invalid_string' && (issue as any).validation === 'email') {
    throw new Error('El correo electrónico no es válido');
  }

  if (issue.code === 'invalid_type') {
    throw new Error(`${fieldLabel} es obligatorio o tiene un formato no válido`);
  }

  throw new Error(issue.message || `${fieldLabel} no es válido`);
}
