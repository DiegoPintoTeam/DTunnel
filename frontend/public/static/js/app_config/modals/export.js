const exportConfigToFile = (config) => {
    const blob = new Blob([config], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'app_config.json';
    anchor.click();
    URL.revokeObjectURL(url);
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
                <div class="__preview d-flex align-items-center justify-content-center mb-3"></div>
                <div class="d-grid">
                    <button type="button" class="btn btn-dark w-100 btn__export">ARCHIVO</button>
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
        this.config = convertConfigToExport(config);

        this.modal = new bootstrap.Modal(this._element);
        this._root.querySelector('.btn__export').addEventListener('click', () => this.export());

        this._preview = this._root.querySelector('.__preview');
        this._preview.appendChild(app.element);
    }

    export() {
        try {
            exportConfigToFile(this.config);
            showToastSuccess('Configuración exportada correctamente!');
        } catch (error) {
            showToastError(error.message);
        }
    }

    show() {
        this.modal.show();
    }
}

export default AppConfigExportModal;