class ConfigAppExportFile {
    constructor(config) {
        this.config = config;
    }

    async export() {
        const blob = new Blob([this.config], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'app_config.json';
        a.click();
        URL.revokeObjectURL(url);
    }
}

class ConfigAppExportFactory {
    static create(type, config) {
        switch (type) {
            case 'FILE':
                return new ConfigAppExportFile(config);
        }
    }
}

const convertConfigToExport = (config) => {
    const items = JSON.parse(
        JSON.stringify(
            config.items.map(item => item.toJson())
        )
    );
    items.forEach(item => {
        delete item.id;
        delete item.user_id;
    });
    return JSON.stringify(items, null, 4);
}

class AppConfigExportModal {
    __html = `
    <div class="modal-dialog modal-md modal-dialog-centered">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title" id="showModalChooseExportOrPasteLabel">Exportar configuración</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
                <textarea class="form-control mb-3 d-none" rows="10"></textarea>
                <div class="__preview d-flex align-items-center justify-content-center mb-3"></div>
                <div class="__spinner justify-content-center p-3 d-none">
                    <div class="spinner-border p-3" role="status">
                        <span class="visually-hidden">Loading...</span>
                    </div>
                </div>
                <div class="d-grid">
                    <button type="button" class="btn btn-dark w-100" data-type="FILE">ARCHIVO</button>
                </div>
            </div>
        </div>
    </div>
    `

    constructor(config, app) {
        this._element = document.createElement('div');
        this._element.classList.add('modal', 'fade');
        this._element.setAttribute('tabindex', '-1');
        this._element.innerHTML = this.__html;

        this._root = this._element.querySelector('.modal-body');
        this._root.querySelector('textarea').value = convertConfigToExport(config);

        this.modal = new bootstrap.Modal(this._element);
        this._root.querySelector('button[data-type="FILE"]').addEventListener('click', () => this.export('FILE'));

        this._preview = this._root.querySelector('.__preview');
        this._preview.appendChild(app.element);
    }

    showLoading() {
        this._root.querySelector('.__spinner').classList.remove('d-none');
        this._root.querySelector('.__spinner').classList.add('d-flex');
    }

    hideLoading() {
        this._root.querySelector('.__spinner').classList.add('d-none');
        this._root.querySelector('.__spinner').classList.remove('d-flex');
    }

    async export(type) {
        showToastInfo('Exportando configuración...');
        this.showLoading();

        try {
            const config = this._root.querySelector('textarea').value;
            const exportConfig = ConfigAppExportFactory.create(type, config);
            await exportConfig.export();

            showToastSuccess('Configuración exportada correctamente!');
        } catch (error) {
            showToastError(error.message);
        } finally {
            this.hideLoading();
        }
    }

    show() {
        this.modal.show();
    }

    hide() {
        this.modal.hide();
    }
}

export default AppConfigExportModal;