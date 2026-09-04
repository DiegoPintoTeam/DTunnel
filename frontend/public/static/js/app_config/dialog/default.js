import AbsDialog from "./dialog.js";

export default class DialogDefault extends AbsDialog {
    render() {
        this.dialogHeader.setTitle('DIALOG ESTÁNDAR');
        this.dialogHeader.setCloseButton(e => {
            e.stopPropagation();
            this.close();
        });
        this.dialogContent.element.innerText = 'ESTE ES UN DIÁLOGO ESTÁNDAR (CHECKUSER, MENSAJE, ETC...)'
        this.setStyle({ 'text-align': 'center' });
        super.render();
    }
}
