import { Observable } from "./observer.js";

const Mode = {
    SSH_DIRECT: 'SSH_DIRECT',
    SSH_PROXY: 'SSH_PROXY',
    SSL_DIRECT: 'SSL_DIRECT',
    SSL_PROXY: 'SSL_PROXY',
    OVPN_PROXY: 'OVPN_PROXY',
    OVPN_SSL: 'OVPN_SSL',
    OVPN_SSL_PROXY: 'OVPN_SSL_PROXY',
    V2RAY: 'V2RAY',
}

const ModeLabels = {
    SSH_DIRECT: 'SSH Directo (Payload)',
    SSH_PROXY: 'SSH con Proxy (HTTP)',
    SSL_DIRECT: 'SSL/TLS Directo (SNI)',
    SSL_PROXY: 'SSL/TLS con Proxy + SNI',
    OVPN_PROXY: 'OpenVPN con Proxy (HTTP)',
    OVPN_SSL: 'OpenVPN con SSL/TLS (SNI)',
    OVPN_SSL_PROXY: 'OpenVPN con SSL + Proxy',
    V2RAY: 'V2Ray / VLESS / VMess',
}

const ModeHints = {
    SSH_DIRECT: '💡 SSH Directo: Puertos usuales: 80, 8080 o 22. Requiere Servidor (IP/Host) y Payload HTTP (ej: GET / HTTP/1.1[crlf]Host: midominio.com[crlf][crlf]).',
    SSH_PROXY: '💡 SSH con Proxy: Servidor SSH (ej: 22 o 443), Proxy Remoto (ej: 80 u 8080) y Payload HTTP de inyección.',
    SSL_DIRECT: '💡 SSL/TLS Directo: Puerto SSL recomendado: 443 (o 8443). Requiere Servidor SSH, Puerto SSL (443) y SNI / Bug Host (ej: m.whatsapp.net).',
    SSL_PROXY: '💡 SSL con Proxy: Puerto SSL (443), Proxy Remoto (80 u 8080), Payload y SNI TLS.',
    OVPN_PROXY: '💡 OpenVPN con Proxy: Puerto Proxy (80 u 8080), Archivo/Certificado .ovpn y Payload HTTP.',
    OVPN_SSL: '💡 OpenVPN SSL: Puerto SSL recomendado: 443. Requiere Archivo/Certificado .ovpn y SNI / Bug Host.',
    OVPN_SSL_PROXY: '💡 OpenVPN SSL + Proxy: Puerto SSL (443), Proxy (80 u 8080), Archivo .ovpn, SNI y Payload.',
    V2RAY: '💡 V2Ray: Puerto recomendado: 443 (TLS) u 80. Requiere Enlace JSON/Vmess/Vless o UUID y Servidor.',
}

const Status = {
    ACTIVE: 'ACTIVE',
    INACTIVE: 'INACTIVE',
}

class AuthModel {
    username;
    password;
    v2ray_uuid;

    static fromJson(data) {
        const model = new AuthModel();
        model.username = data.username;
        model.password = data.password;
        model.v2ray_uuid = data.v2ray_uuid;
        return model;
    }
}

class CategoryModel {
    id;
    user_id;
    name;
    color;
    sorter;
    status;

    static fromJson(data) {
        const model = new CategoryModel();
        model.id = data.id;
        model.user_id = data.user_id;
        model.name = data.name;
        model.color = data.color;
        model.sorter = data.sorter;
        model.status = data.status;
        return model;
    }
}

class DnsServerModel {
    dns1;
    dns2;

    static fromJson(data) {
        const model = new DnsServerModel();
        model.dns1 = data?.dns1 ?? '8.8.8.8';
        model.dns2 = data?.dns2 ?? '8.8.4.4';
        return model;
    }
}

class ProxyModel {
    constructor({ host, port }) {
        this.host = host ?? null;
        this.port = port ?? null;
    }

    static fromJson(data) {
        return new ProxyModel(data);
    }
}

class ServerModel {
    constructor({ host, port }) {
        this.host = host ?? null;
        this.port = port ?? null;
    }

    static fromJson(data) {
        return new ServerModel(data);
    }
}

class ConfigPayloadModel {
    payload;
    sni;

    static fromJson(data) {
        const model = new ConfigPayloadModel();
        model.payload = data?.payload;
        model.sni = data?.sni;
        return model;
    }
}

class ConfigModel {
    id;
    category_id;
    user_id;
    name;
    description;
    mode;
    tls_version;
    sorter;
    status;
    auth;
    category;
    config_openvpn;
    config_payload;
    config_v2ray;
    dns_server;
    icon;
    proxy;
    server;
    udp_ports;
    url_check_user;

    static fromJson(data) {
        const model = new ConfigModel();
        model.id = data.id;
        model.category_id = data.category_id;
        model.user_id = data.user_id;
        model.name = data.name;
        model.description = data.description;
        model.mode = data.mode;
        model.tls_version = data.tls_version || 'TLSv1.2';
        model.sorter = data.sorter;
        model.status = data.status;
        model.auth = AuthModel.fromJson(data.auth);
        model.category = data.category ? CategoryModel.fromJson(data.category) : null;
        model.config_payload = ConfigPayloadModel.fromJson(data.config_payload);
        model.config_openvpn = data.config_openvpn ? this.base64Decode(data.config_openvpn) : null;
        model.config_v2ray = data.config_v2ray ? this.base64Decode(data.config_v2ray) : null;
        model.dns_server = DnsServerModel.fromJson(data.dns_server);
        model.icon = data.icon;
        model.proxy = ProxyModel.fromJson(data.proxy ?? {});
        model.server = ServerModel.fromJson(data.server ?? {});
        model.udp_ports = data?.udp_ports ?? [7300];
        model.url_check_user = data.url_check_user;
        return model;
    }

    toJson() {
        const ovpn = this.config_openvpn && btoa(this.config_openvpn);
        const v2ray = this.config_v2ray && btoa(this.config_v2ray);
        const item = JSON.parse(JSON.stringify(this));
        item.config_openvpn = ovpn;
        item.config_v2ray = v2ray;
        return JSON.stringify(item, null, 4);
    }

    static base64Decode(data) {
        try {
            return atob(data);
        } catch (e) {
            return data;
        }
    }
}

class CategoryList extends Observable {
    constructor() {
        super();
        this.categories = [];
        this.items = {};
    }

    exists(category) {
        return this.categories.find(item => item.id === category.id);
    }

    append(category) {
        if (this.exists(category)) return;
        this.categories.push(category);
        this.items[category.id] = [];
        this.notify('append', category);
    }

    sync(category, configs) {
        if (!this.exists(category)) {
            this.categories.push(category);
        }

        this.items[category.id] = [];
        configs.forEach(config => {
            if (config.category_id === category.id) {
                this.items[category.id].push(config);
            }
        });
    }

    get(id) {
        return this.categories.find(item => item.id === id);
    }

    getSorter(categoryId) {
        const items = this.items[categoryId];
        if (!items || items.length === 0) return 1;
        return items[items.length - 1].sorter + 1;
    }

    remove(configId) {
        for (let categoryId in this.items) {
            this.items[categoryId] = this.items[categoryId].filter(item => item.id !== configId);
        }
    }
}

class ConfigList extends Observable {
    constructor(items = []) {
        super();
        this.items = items;
    }

    getItems() {
        return this.items;
    }

    getItemsByStatus(status) {
        if (status == 'ALL') {
            return this.items;
        }
        return this.items.filter(item => item.status == status);
    }

    append(item) {
        if (!item.id) item.id = this.items.length + 1;
        this.items.push(item);
        this.notify('append', item);
    }

    remove(id) {
        this.items = this.items.filter(item => item.id !== id);
        this.notify('remove', id);
    }

    update(item) {
        this.items = this.items.map(i => i.id === item.id ? item : i);
        this.notify('update', item);
    }

    get(id) {
        return this.items.find(item => item.id === id);
    }

    duplicate(id) {
        const item = this.get(id);
        const newItem = ConfigModel.fromJson(JSON.parse(JSON.stringify(item)));
        delete newItem.id;
        newItem.name = `${newItem.name} (COPY)`;
        this.append(newItem);
    }

    toggleStatus(id) {
        const item = this.get(id);
        item.status = item.status == Status.ACTIVE ? Status.INACTIVE : Status.ACTIVE;
        this.update(item);
    }

    sort() {
        this.items.sort((a, b) => {
            if (a.category_id === b.category_id)
                return a.sorter - b.sorter;
            return a.category.sorter - b.category.sorter;
        });
    }
}


export {
    Mode,
    ModeLabels,
    ModeHints,
    Status,
    AuthModel,
    CategoryModel,
    ConfigList,
    CategoryList,
}

export default ConfigModel;