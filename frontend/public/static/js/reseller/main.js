import Search from '../config/components/search.js';
import Pagination from '../common/pagination.js';

const tableBody = document.getElementById('resellersTableBody');
const notFound = document.querySelector('.__not_found');
const search = new Search(document.querySelector('.search-reseller'));
const pagination = new Pagination(document.querySelector('#pagination'));

let packages = [];

const formatDate = (value) => {
    if (!value) return '<span class="text-muted">Sin paquete</span>';
    const date = new Date(value);
    return date.toLocaleDateString('es-ES', { year: 'numeric', month: '2-digit', day: '2-digit' });
};

const getPackages = async () => {
    const response = await fetch('/package_list');
    const data = await response.json();
    packages = data.data || [];
};

const packageOptions = (selectedId) => {
    let html = '<option value="">Sin paquete</option>';
    for (const pkg of packages) {
        html += `<option value="${pkg.id}" ${selectedId === pkg.id ? 'selected' : ''}>${pkg.name}</option>`;
    }
    return html;
};

const getResellers = async () => {
    const query = new URLSearchParams({
        search: search.query || '',
        offset: pagination.offset,
        limit: pagination.limit,
    });

    const response = await fetch(`/reseller_list?${query.toString()}`);
    const data = await response.json();

    pagination.offset = data.data.offset;
    pagination.limit = data.data.limit;
    pagination.total = data.data.total;
    pagination.mount();

    return data.data.result;
};

const buildResellerModal = (reseller = null) => {
    const isEdit = Boolean(reseller);
    const modalRoot = document.createElement('div');
    modalRoot.classList.add('modal', 'fade');
    modalRoot.tabIndex = -1;
    modalRoot.innerHTML = `
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">${isEdit ? 'Editar revendedor' : 'Nuevo revendedor'}</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <form class="__form" autocomplete="off">
                        <div class="mb-3">
                            <label class="form-label">Usuario</label>
                            <input type="text" class="__username form-control" required value="${reseller?.username ?? ''}" autocomplete="off">
                        </div>
                        <div class="mb-3">
                            <label class="form-label">Email</label>
                            <input type="email" class="__email form-control" required value="${reseller?.email ?? ''}" autocomplete="off">
                        </div>
                        <div class="mb-3">
                            <label class="form-label">Contraseña${isEdit ? ' (dejar vacío para no cambiar)' : ''}</label>
                            <input type="password" class="__password form-control" ${isEdit ? '' : 'required'} placeholder="********" autocomplete="new-password">
                        </div>
                        <div class="mb-3">
                            <label class="form-label">Paquete</label>
                            <select class="__package form-select">${packageOptions(reseller?.package_id ?? null)}</select>
                        </div>
                    </form>
                </div>
                <div class="modal-footer d-flex justify-content-between flex-nowrap">
                    <button type="button" class="btn-responsive w-100 me-2" data-bs-dismiss="modal">Cerrar</button>
                    <button type="button" class="__btn__save btn-responsive w-100">Guardar</button>
                </div>
            </div>
        </div>
    `;

    return modalRoot;
};

const openResellerModal = (reseller = null) => {
    const modalRoot = buildResellerModal(reseller);
    document.body.appendChild(modalRoot);
    const modal = new bootstrap.Modal(modalRoot);

    modalRoot.querySelector('.__btn__save').addEventListener('click', async () => {
        const form = modalRoot.querySelector('.__form');
        if (!form.reportValidity()) return;

        const body = {
            username: modalRoot.querySelector('.__username').value,
            email: modalRoot.querySelector('.__email').value,
            password: modalRoot.querySelector('.__password').value,
            package_id: modalRoot.querySelector('.__package').value || undefined,
        };

        const url = reseller ? `/reseller/${reseller.id}` : '/reseller';
        const method = reseller ? 'PUT' : 'POST';

        try {
            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });

            if (response.status === 201 || response.status === 200) {
                showToastSuccess(`Revendedor ${body.username} ${reseller ? 'actualizado' : 'creado'} con éxito!`);
                modal.hide();
                renderApp();
                return;
            }

            const data = await response.json();
            showToastError(data.message || 'No se pudo guardar el revendedor');
        } catch (err) {
            showToastError('No se pudo guardar el revendedor');
        }
    });

    modalRoot.addEventListener('hidden.bs.modal', () => modalRoot.remove());
    modal.show();
};

const deleteReseller = async (reseller) => {
    try {
        const response = await fetch(`/reseller/${reseller.id}`, { method: 'DELETE' });
        if (response.status === 204) {
            showToastSuccess(`Revendedor ${reseller.username} eliminado con éxito!`);
            renderApp();
            return;
        }
        const data = await response.json();
        showToastError(data.message || 'No se pudo borrar el revendedor');
    } catch (err) {
        showToastError('No se pudo borrar el revendedor');
    }
};

const renderRow = (reseller) => {
    const row = document.createElement('tr');
    row.innerHTML = `
        <td>${reseller.username}</td>
        <td>${reseller.email}</td>
        <td>${reseller.package ? reseller.package.name : '<span class="text-muted">Sin paquete</span>'}</td>
        <td>${formatDate(reseller.expires_at)}</td>
        <td>
            <div class="table-actions">
                <button type="button" class="btn btn-dark table-action-btn __btn__edit" title="Editar"><i class="fas fa-pen-to-square"></i></button>
                <button type="button" class="btn btn-dark table-action-btn __btn__delete" title="Eliminar"><i class="fas fa-trash"></i></button>
            </div>
        </td>
    `;

    row.querySelector('.__btn__edit').addEventListener('click', () => openResellerModal(reseller));
    row.querySelector('.__btn__delete').addEventListener('click', () => {
        showAlertConfirm(() => deleteReseller(reseller));
    });

    return row;
};

const renderApp = async () => {
    const resellers = await getResellers();

    tableBody.innerHTML = '';
    notFound.classList.toggle('d-none', resellers.length > 0);

    resellers.forEach((reseller) => tableBody.appendChild(renderRow(reseller)));
};

const main = async () => {
    await getPackages();

    search.setOnSearch(() => renderApp());
    search.render();

    pagination.setOnPageChange(() => renderApp());

    document.querySelector('.__btn__add').addEventListener('click', () => openResellerModal());

    await renderApp();
};

main();
