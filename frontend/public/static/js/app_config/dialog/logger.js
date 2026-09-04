import AbsDialog from "./dialog.js";

export default class DialogLogger extends AbsDialog {
    render() {
        this.dialogHeader.setTitle('DIALOG DE REGISTRO');
        this.dialogHeader.setCloseButton(e => {
            e.stopPropagation();
            this.close();
        });
        this.dialogContent.element.innerHTML = 'ESTE ES UN DIÁLOGO DE REGISTRO';
        this.setStyle({ 'text-align': 'center' });
        super.render();
    }
}
