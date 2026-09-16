const ExportType = {
    FILE: 'FILE',
    APP: 'APP'
}

class ConfigExportFile {
    async export(data) {
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.download = 'config.json';
        a.href = url;
        a.click();
        URL.revokeObjectURL(url);
        showToastSuccess('Vaya! configuración exportada correctamente!');;
    }
}

class ConfigExportApp {
    async export(data) {
        if (!this.validate(data)) return;

        const options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ config: data })
        };

        try {
            const response = await fetch('/app_config/export/app', options);
            const result = await response.json();
            if (result.config) {
                showToastSuccess('Vaya! configuración exportada correctamente!');
                return `vpn://${result.config}`
            }
        } catch (e) {
            showToastError('Ops! No se pudo importar la configuración!');
        }
    }

    validate(data) {
        const config = JSON.parse(data);
        if (Array.isArray(config)) {
            showToastError('Lamentablemente, no es posible exportar múltiples configuraciones a la aplicación!');
            return false;
        }
        return true;
    }
}

class ConfigExportFactory {
    static create(type) {
        switch (type) {
            case ExportType.FILE:
                return new ConfigExportFile();
            case ExportType.APP:
                return new ConfigExportApp();
            default:
                throw new Error('Invalid export type!');
        }
    }
}

export default ConfigExportFactory;