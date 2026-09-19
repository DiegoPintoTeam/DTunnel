class Pagination {
    constructor(root) {
        this.root = root;

        this.offset = 1;
        this.limit = 200;
        this.total = 0;
        this.count = 0;

        this.element = document.createElement('ul');
        this.element.classList.add('pagination', 'justify-content-end', 'me-2', 'mb-0');

        this.callback = null;
    }

    setOnPageChange(callback) {
        this.callback = callback;

        this.element.addEventListener('click', event => {
            event.preventDefault();
            this.offset = parseInt(event.target.dataset.page);
            this.callback();
        });
    }

    renderPreviusButton() {
        let html = '';
        if (this.offset > 1)
            html += `<li class="page-item prev"><a class="page-link" href="#" data-page="${this.offset - 1}"><span aria-hidden="true">&laquo;</span></a></li>`;
        return html;
    }

    renderNextButton() {
        let html = '';
        if (this.offset < Math.ceil(this.total / this.limit))
            html += `<li class="page-item next"><a class="page-link" href="#" data-page="${this.offset + 1}"><span aria-hidden="true">&raquo;</span></a></li>`;
        return html;
    }

    RenderConfigButtons() {
        let html = '';
        const pages = Math.ceil(this.total / this.limit);
        const start = Math.max(1, this.offset - 2);
        const end = Math.min(pages, this.offset + 2);
        for (let i = start; i <= end; i++) {
            html += `<li class="page-item ${i === this.offset ? 'active' : ''}"><a class="page-link" href="#" data-page="${i}">${i}</a></li>`;
        }
        return html;
    }

    render() {
        if (this.total <= this.limit) {
            this.element.innerHTML = '';
            return;
        }
        this.element.innerHTML = this.renderPreviusButton() + this.RenderConfigButtons() + this.renderNextButton();
    }

    mount() {
        this.render();

        const nav = document.createElement('nav');
        nav.appendChild(this.element);

        if (this.root) {
            this.root.innerHTML = '';
            this.root.appendChild(nav);
        };
        return nav;
    }
}

export default Pagination;