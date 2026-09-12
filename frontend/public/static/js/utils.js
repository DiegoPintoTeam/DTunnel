const hideElement = (element) => {
    element.style.display = 'none';
}

const showElement = (element) => {
    element.style.removeProperty('display');
}

const showElements = (elements) => {
    elements.forEach(showElement);
}

const setRequired = (element, isRequired) => {
    if (isRequired) {
        element.setAttribute('required', isRequired);
    } else {
        element.removeAttribute('required');
    }
}

const setRequiredElements = (elements, isRequired) => {
    elements.forEach(element => setRequired(element, isRequired));
}

const getCsrfTokenHead = () => document.querySelector('meta[name="csrf-token"]').getAttribute('content');
const getCsrfTokenRefresh = (request) => request.headers.get('csrf-token');

const showToastSuccess = (message) => {
    Toastify({
        text: message,
        duration: 2000,
        close: true,
        gravity: "top",
        position: "right",
        style: {
            background: "linear-gradient(to right, #00b09b, #96c93d)",
        },
        stopOnFocus: true,
    }).showToast();
};

const showToastError = (message) => {
    Toastify({
        text: message,
        duration: 2000,
        close: true,
        gravity: "top",
        position: "right",
        style: {
            background: "linear-gradient(to right, #b00000, #c93d3d)",
            maxWidth: '70%',
        },
        stopOnFocus: true,
    }).showToast();
};

const showToastWarning = (message) => {
    Toastify({
        text: message,
        duration: 2000,
        close: true,
        gravity: "top",
        position: "right",
        style: {
            background: "linear-gradient(to right, #ff5e62, #ff9966)",
        },
        stopOnFocus: true,
    }).showToast();
};

const showToastInfo = (message) => {
    Toastify({
        text: message,
        duration: 2000,
        close: true,
        gravity: "top",
        position: "right",
        style: {
            background: "linear-gradient(to right, #00b09b, #96c93d)",
        },
        stopOnFocus: true,
    }).showToast();
};

const uploadImage = async (e, element) => {

    showToastInfo('Espera, enviando imagen...');

    const form = new FormData();
    form.append('file', e.files[0]);

    const response = await fetch('/upload/image', {
        method: 'POST',
        body: form
    });

    const data = await response.json();
    if (data.status == 200) {
        showToastSuccess('Vaya! Imagen cargada con éxito!');
        if (element) element.value = data.url;
        return data.url;
    }

    if (data.message) {
        showToastError(data.message);
        return;
    }

    showToastError('Ops! No se pudo subir la imagen!');
}

const copyToClipboard = data => {
    var $temp = $("<textarea>");
    $("body").append($temp);
    $temp.val(data).select();
    document.execCommand("copy");
    $temp.remove();
}

const showAlertConfirm = (callback, message) => {
    Swal.fire({
        title: 'Estás seguro?',
        text: message || 'No podrás revertir esto!',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#212529',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sí',
        cancelButtonText: 'No',
        reverseButtons: true,
        width: '25rem'
    }).then((result) => {
        if (result.value) {
            callback();
        }
    })
}

const restartPanel = () => {
    showAlertConfirm(async () => {
        try {
            const response = await fetch('/panel/restart', { method: 'POST' });
            const data = await response.json();

            if (!response.ok) {
                showToastError(data.message || 'No se pudo reiniciar el panel.');
                return;
            }

            showToastSuccess(data.message || 'El panel se está reiniciando...');
        } catch (err) {
            showToastError('No se pudo solicitar el reinicio del panel.');
        }
    }, 'El panel se reiniciará y quedará unos segundos sin responder.');
}