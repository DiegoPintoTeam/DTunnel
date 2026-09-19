document.getElementById('btnExportBackup').addEventListener('click', () => {
    window.location.href = '/backup/export';
});

document.getElementById('btnImportBackup').addEventListener('click', () => {
    const input = document.getElementById('restoreBackupFile');
    const file = input.files[0];

    if (!file) {
        showToastError('Selecciona un archivo .zip primero');
        return;
    }

    showAlertConfirm(async () => {
        try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await fetch('/backup/import', {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();

            if (response.status === 200) {
                showToastSuccess(data.message || 'Copia de seguridad restaurada con éxito');
                input.value = '';
                return;
            }

            showToastError(data.message || 'No se pudo restaurar la copia de seguridad');
        } catch (err) {
            showToastError('No se pudo restaurar la copia de seguridad');
        }
    }, 'Esto reemplazará la base de datos actual del panel. ¿Deseas continuar?');
});
