export default class Table {
    constructor(items = []) {
        this.items = items;

        this.element = document.createElement('div');
        this.element.classList.add('table-responsive-md', 'h-100');
        this.element.innerHTML = this.getTableHTML();

        this.tbody = this.element.querySelector('tbody');
        this.notFound = document.querySelector('.config-not-found');

        this.bindEvents();
    }

    getTableHTML() {
        return `
        <table class="table table-striped table-hover table-sm text-center">
          <thead>
            <tr>
              <th scope="col">
                <input class="form-check form-check-input check-item" type="checkbox">
              </th>
              <th scope="col" class="border-0" placeholder="#">#</th>
              <th scope="col" class="border-0" placeholder="NOMBRE">Nombre</th>
              <th scope="col" class="border-0" placeholder="CATEGORÍA">Categoría</th>
              <th scope="col" class="border-0" placeholder="ORDEN">Orden</th>
              <th scope="col" class="border-0" placeholder="MODO">Modo</th>
              <th scope="col" class="border-0" placeholder="Status">Status</th>
              <th scope="col" class="border-0" placeholder="ACCIONES">Acciones</th>
            </tr>
          </thead>
          <tbody></tbody>
        </table>
      `;
    }

    bindEvents() {
        const checkAllCheckbox = this.element.querySelector('.check-item');
        checkAllCheckbox.addEventListener('change', () => this.checkAll(checkAllCheckbox.checked));
    }

    appendItem(item) {
        this.items.push(item);
    }

    filter(status) {
        return this.items.filter(item => item.status === status);
    }

    showNotFound() {
        this.element.classList.add('d-none');
        this.notFound.classList.remove('d-none');
    }

    closeNotFound() {
        this.element.classList.remove('d-none');
        this.notFound.classList.add('d-none');
    }

    getCheckedItems() {
        return this.items.filter(item => item.isChecked());
    }

    checkAll(checked) {
        this.items.forEach(item => item.setChecked(checked));
    }

    render() {
        if (this.items.length === 0) {
            this.showNotFound();
            return;
        }

        this.closeNotFound();

        this.tbody.innerHTML = '';
        this.items.forEach(item => this.tbody.appendChild(item.element));
    }
}

export class TableItem {
    constructor(config) {
        this.config = config;
        this.element = document.createElement('tr');
        this.render();
    }

    render() {
        const { id, name, category, sorter, mode, status } = this.config;
        this.element.innerHTML = `
        <td class="align-middle" scope="row">
          <input class="form-check form-check-input check-item" type="checkbox">
        </td>
        <td class="align-middle">${id}</td>
        <td class="align-middle text-nowrap">${name}</td>
        <td class="align-middle">
          <div class="badge rounded-pill text-bg-dark">
            ${category?.name}
          </div>
        </td>
        <td class="align-middle">
          <div class="config-order-cell">
            <button type="button" class="btn btn-order-control btn-order-up" ${sorter > 1 ? '' : 'disabled'}>
              <i class="fa-solid fa-arrow-up"></i>
            </button>
            <span class="config-order-value">${sorter}</span>
            <button type="button" class="btn btn-order-control btn-order-down">
              <i class="fa-solid fa-arrow-down"></i>
            </button>
          </div>
        </td>
        <td class="align-middle">
          <div class="badge rounded-pill text-bg-dark">
            ${mode}
          </div>
        </td>
        <td class="align-middle">
          <button type="button" class="btn btn-status-toggle ${status === 'ACTIVE' ? 'is-active' : 'is-inactive'}">
            <i class="fas ${status === 'ACTIVE' ? 'fa-check' : 'fa-xmark'}"></i>
            <span>${status === 'ACTIVE' ? 'ACTIVO' : 'INACTIVO'}</span>
          </button>
        </td>
        <td class="align-middle">
          <div class="table-actions">
            <button class="btn btn-dark table-action-btn btn-c-edit" title="Editar">
              <i class="fas fa-pen-to-square"></i>
            </button>
            <button class="btn btn-dark table-action-btn btn-c-copy" title="Copiar">
              <i class="fas fa-copy"></i>
            </button>
            <button class="btn btn-dark table-action-btn btn-c-delete" title="Eliminar">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </td>
      `;
    }

    setOnClickEdit(callback) {
        this.element.querySelector('.btn-c-edit').addEventListener('click', callback);
    }

    setOnClickCopy(callback) {
        this.element.querySelector('.btn-c-copy').addEventListener('click', callback);
    }

    setOnClickDelete(callback) {
        this.element.querySelector('.btn-c-delete').addEventListener('click', callback);
    }

    setOnToggleStatus(callback) {
      this.element.querySelector('.btn-status-toggle').addEventListener('click', callback);
    }

    setOnOrderUp(callback) {
      this.element.querySelector('.btn-order-up').addEventListener('click', callback);
    }

    setOnOrderDown(callback) {
      this.element.querySelector('.btn-order-down').addEventListener('click', callback);
    }

    isChecked() {
        return this.element.querySelector('.check-item').checked;
    }

    setChecked(checked = true) {
        this.element.querySelector('.check-item').checked = checked;
    }
}