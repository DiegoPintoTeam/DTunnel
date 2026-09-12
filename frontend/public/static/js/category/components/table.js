class CategoryTable {
    constructor(items = []) {
        this.items = items

        this.table = document.createElement('table')
        this.table.classList.add('table', 'table-striped', 'table-hover', 'table-sm', 'text-center')
    }

    render() {
        this.table.innerHTML = `
            <thead>
                <tr>
                    <th>
                        <input class="form-check form-check-input check-item" type="checkbox">
                    </th>
                    <th>Id</th>
                    <th>Nombre</th>
                    <th>Orden</th>
                    <th scope="col">Color</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                </tr>
            </thead>
            <tbody>
            </tbody>
        `

        this.table.querySelector('.check-item').addEventListener('click', e => this.checkAll(e.target.checked));
        const tbody = this.table.querySelector('tbody')
        this.items.forEach(item => tbody.appendChild(item.render()))

        const div = document.createElement('div')
        div.classList.add('table-responsive')
        div.appendChild(this.table)
        return div
    }

    getCheckedItems() {
        return this.items.filter(item => item.isChecked())
    }

    checkAll(checked) {
        this.items.forEach(item => item.check(checked))
    }
}

class TableItem {
    constructor(category) {
        this.category = category
        this.element = document.createElement('tr')

        this.onClickDelete = null
        this.onClickEdit = null
        this.onClickStatus = null
    }

    setOnClickDelete(fn) {
        this.onClickDelete = fn
    }

    setOnClickEdit(fn) {
        this.onClickEdit = fn
    }

    setOnClickStatus(fn) {
        this.onClickStatus = fn
    }

    render() {
        this.element.innerHTML = `
            <td>
                <input class="form-check form-check-input check-item" type="checkbox" value="${this.category.id}">
            </td>
            <td>${this.category.id}</td>
            <td>${this.category.name}</td>
            <td>${this.category.sorter}</td>
            <td>
                <span class="badge rounded-pill" style="background: ${this.category.color};">
                    ${this.category.color}
                </span>
            </td>
            <td>
                <button type="button" class="btn btn-status-toggle ${this.category.status == 'ACTIVE' ? 'is-active' : 'is-inactive'}">
                    ${this.category.status == 'ACTIVE' ? 'ACTIVO' : 'INACTIVO'}
                </button>
            </td>
            <td>
                <div class="table-actions">
                    <button class="btn btn-dark table-action-btn" title="Editar">
                        <i class="fas fa-pen-to-square"></i>
                    </button>
                    <button href="#" class="btn btn-dark table-action-btn" title="Eliminar">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        `

        this.setupButtons()
        return this.element
    }

    setupButtons() {
        const btnDelete = this.element.querySelector('.btn-dark:last-child')
        btnDelete.addEventListener('click', event => {
            event.preventDefault()
            if (this.onClickDelete) this.onClickDelete(this.category)
        })

        const btnEdit = this.element.querySelector('.btn-dark:first-child')
        btnEdit.addEventListener('click', event => {
            event.preventDefault()
            if (this.onClickEdit) this.onClickEdit(this.category)
        })

        const btnStatus = this.element.querySelector('.btn-status-toggle')
        btnStatus.addEventListener('click', event => {
            event.preventDefault()
            if (this.onClickStatus) this.onClickStatus(this.category)
        })
    }

    isChecked() {
        return this.element.querySelector('input[type="checkbox"]').checked
    }

    check(checked = true) {
        this.element.querySelector('input[type="checkbox"]').checked = checked
    }
}

export default CategoryTable
export { TableItem }
