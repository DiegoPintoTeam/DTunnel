class Button {
    constructor(element) {
        this.button = element
    }

    setOnClick(fn) {
        this.button.addEventListener('click', fn);
    }
}

class ButtonAdd extends Button {
    constructor() {
        super(document.querySelector('.__btn__add'));
    }
}

export { ButtonAdd };