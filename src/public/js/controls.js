
/*Controles para una aplicacion web usando bootstrap

Uso
    El modulo arroja una clase con distintos metodos para arrojar controles al usuario
    los metodos de los que se dispone son
    Control.toast(msg (string), tipo(int) )
        -Crea un toast que desaparece a los 2 segundos, hay varios tipos de toast
            tipo 1: Succes
            tipo 2: Primary
            tipo 3: Warning
            tipo 4: Danger
        Dependiendo del tipo el toast tendra un icono distinto
        Ejemplo
        Control.toast("Mensaje",1);
        Muestra un mensaje verde con una palomita antes del texto
    
    Control.ok(header(string),body(string),form(form)= undefined);
        

    ok

*/
class Control{
    get _options_default() {
        return {
            centered: true,
            backdrop: 'static',
            keyboard: true,
            focus: true,
            close: true,
            size: '',
            fullscreen: null,
            scrollable: false
        }
    }

    constructor(options = {}) {
        const _this = this
        this._recalculate_z_index()
        this._options = Object.assign({}, this._options_default, options)
        this._bs_options = {
            backdrop: this._options.backdrop,
            keyboard: this._options.keyboard,
            focus: this._options.focus
        }
        this._modal_div = document.createElement('div')
        this._modal_div.className = 'modal fade'
        this._modal_div.tabIndex = -1
        this._modal_div.insertAdjacentHTML('beforeend', this._modal_html())
        this._modal_header = this._modal_div.querySelector('h5.modal-title')
        this._modal_body = this._modal_div.querySelector('div.modal-body')
        this._modal_footer = this._modal_div.querySelector('div.modal-footer')
        this._modal_close = this._modal_div.querySelector('button.btn-close')
        document.body.appendChild(this._modal_div)
    }

    _modal_html() {
        let cls = ['modal-dialog']
        if (this._options.centered) {
            cls.push('modal-dialog-centered')
        }
        if (this._options.size !== '') {
            cls.push('modal-' + this._options.size)
        }
        if (this._options.fullscreen !== null) {
            if (this._options.fullscreen === '') {
                cls.push('modal-fullscreen')
            } else {
                cls.push('modal-fullscreen-' + this._options.fullscreen)
            }
        }
        if (this._options.scrollable) {
            cls.push('modal-dialog-scrollable')
        }


        let close_btn = `<button type="button" class="btn-close" data-ret="" aria-label="Close"></button>`
        if (!this._options.close) {
            close_btn = ''
        }

        return `<div class="${cls.join(' ')}">
            <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title"></h5>${close_btn}
            </div>
            <div class="modal-body"></div>
            <div class="modal-footer"></div>
            </div>
        </div>`
    }

    _serialize_form(frm) {
        let ret_dict = {}
        const selectors = frm.querySelectorAll("input")
        selectors.forEach(function (selector) {
            if (selector.dataset.name) {
                if (selector.type === 'checkbox') {
                    if (selector.checked && selector.name) {
                        try {
                            ret_dict[selector.name].push(selector.dataset.name)
                        } catch {
                            ret_dict[selector.name] = []
                            ret_dict[selector.name].push(selector.dataset.name)
                        }
                    }
                } else {
                    ret_dict[selector.dataset.name] = selector.value
                }
            } else {
                if (selector.type === 'radio') {
                    if (selector.checked && selector.name) {
                        ret_dict[selector.name] = selector.value
                    }
                }
            }

        });
        return ret_dict
    }

    _recalculate_z_index() {
        document.addEventListener('shown.bs.modal', function (e) {
            let el = e.target
            let all_modal = document.querySelectorAll('.modal')
            let zIndex = 1040
            all_modal.forEach(function (el) {
                if (getComputedStyle(el).display !== 'none')
                    zIndex += 10
            })
            el.style.zIndex = zIndex.toString()
            setTimeout(function () {
                //$('.modal-backdrop').not('.modal-stack').css('z-index', zIndex - 1).addClass('modal-stack');
                let modal_backdrop = document.querySelectorAll('.modal-backdrop')
                modal_backdrop.forEach(function (el) {
                    if (!el.classList.contains('modal-stack')) {
                        el.style.zIndex = (zIndex - 1).toString()
                        el.classList.add('modal-stack')
                    }
                })
            }, 0);
        })
    }

    custom(header, body, buttons = []) {
        const _this = this
        this._modal_header.innerHTML = header
        this._modal_body.innerHTML = body
        for (let button of buttons) {
            let btn_el = document.createElement('button')
            btn_el.className = 'btn ' + button[1]
            btn_el.textContent = button[0]
            btn_el.dataset.ret = button[2]
            this._modal_footer.appendChild(btn_el)
        }
        this._modal_bs = new bootstrap.Modal(this._modal_div, _this._bs_options)
        this._modal_bs.show()
        return new Promise((resolve, reject) => {
            for (let button of _this._modal_div.querySelectorAll('button[data-ret]')) {
                button.addEventListener("click", function (e) {
                    _this.close()
                    if (e.target.dataset.ret === '') {
                        e.target.dataset.ret = false
                    }
                    resolve(e.target.dataset.ret)
                })
            }
            _this._modal_div.addEventListener('hidden.bs.modal', function () {
                resolve(false)
                _this.close()
            })
        })
    }

    async okCancel(header, body,form=undefined) {
        let res = await this.custom(header, body, [['Ok', 'btn-pri', true],['Cancelar', 'btn-sec', false]]);
        res = (res==='true');
        if (!!form && res)
            form.submit();
        else
            return res;
    }

    async ok(header, body,form=undefined) {
        let res =  await this.custom(header, body, [['Ok', 'btn-pri', true]])
        res = (res==='true');
        if (!!form && res)
            form.submit();
        else
            return res;
    }

    form(header, ok_btn_text, form) {
        const _this = this
        this._modal_header.innerHTML = header
        this._modal_body.innerHTML = form
        this._modal_bs = new bootstrap.Modal(this._modal_div, this._bs_options)
        this._form_el = this._modal_body.querySelector('form')
        //
        let submit_btn = document.createElement('button')
        submit_btn.hidden = true
        submit_btn.type = 'submit'
        this._form_el.appendChild(submit_btn)
        //
        let ok_btn = document.createElement('button')
        ok_btn.className = 'btn btn-primary'
        ok_btn.textContent = ok_btn_text
        ok_btn.onclick = function () {
            submit_btn.click()
        }
        this._modal_footer.appendChild(ok_btn)
        //
        this._modal_bs.show()

    }

    async onsubmit(loop = false) {
        const _this = this
        return new Promise((resolve, reject) => {
            _this._form_el.onsubmit = function (e) {
                e.preventDefault()
                resolve(_this._serialize_form(_this._form_el))
                if (!loop) {
                    _this.close()
                }
            }

            _this._modal_close.onclick = function () {
                resolve(undefined)
                _this.close()
            }

            _this._modal_div.addEventListener('hidden.bs.modal', function () {
                resolve(undefined)
                _this.close()
            })
        })
    }

    close() {
        try {
            this._modal_bs.hide()
            this._modal_div.remove()
        } catch {
        }
    }

    set append_body(el) {
        this._modal_body.appendChild(el)
    }

    toast = async(msg,tipo)=>{
        let t = document.createElement('div');
        switch(tipo){
            case 1:
                t.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" style="display: none;">
                <symbol id="check-circle-fill" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z"/>
                </symbol>
                <symbol id="info-fill" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm.93-9.412-1 4.705c-.07.34.029.533.304.533.194 0 .487-.07.686-.246l-.088.416c-.287.346-.92.598-1.465.598-.703 0-1.002-.422-.808-1.319l.738-3.468c.064-.293.006-.399-.287-.47l-.451-.081.082-.381 2.29-.287zM8 5.5a1 1 0 1 1 0-2 1 1 0 0 1 0 2z"/>
                </symbol>
                <symbol id="exclamation-triangle-fill" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767L8.982 1.566zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5zm.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"/>
                </symbol>
                </svg>   <svg class="bi flex-shrink-0 me-2" width="24" height="24" role="img" aria-label="Success:"><use xlink:href="#check-circle-fill"/></svg>`
                t.innerHTML= t.innerHTML+msg
                t.className = 'alert alert-success fixed-bottom m-0'

                break;
            case 2:
                t.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" style="display: none;">
                <symbol id="check-circle-fill" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z"/>
                </symbol>
                <symbol id="info-fill" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm.93-9.412-1 4.705c-.07.34.029.533.304.533.194 0 .487-.07.686-.246l-.088.416c-.287.346-.92.598-1.465.598-.703 0-1.002-.422-.808-1.319l.738-3.468c.064-.293.006-.399-.287-.47l-.451-.081.082-.381 2.29-.287zM8 5.5a1 1 0 1 1 0-2 1 1 0 0 1 0 2z"/>
                </symbol>
                <symbol id="exclamation-triangle-fill" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767L8.982 1.566zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5zm.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"/>
                </symbol>
                </svg> <svg class="bi flex-shrink-0 me-2" width="24" height="24" role="img" aria-label="Info:"><use xlink:href="#info-fill"/></svg>`
                t.innerHTML= t.innerHTML+msg
                t.className = 'alert alert-primary fixed-bottom m-0'
            break;
            case 3:
                t.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" style="display: none;">
                <symbol id="check-circle-fill" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z"/>
                </symbol>
                <symbol id="info-fill" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm.93-9.412-1 4.705c-.07.34.029.533.304.533.194 0 .487-.07.686-.246l-.088.416c-.287.346-.92.598-1.465.598-.703 0-1.002-.422-.808-1.319l.738-3.468c.064-.293.006-.399-.287-.47l-.451-.081.082-.381 2.29-.287zM8 5.5a1 1 0 1 1 0-2 1 1 0 0 1 0 2z"/>
                </symbol>
                <symbol id="exclamation-triangle-fill" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767L8.982 1.566zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5zm.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"/>
                </symbol>
                </svg>   <svg class="bi flex-shrink-0 me-2" width="24" height="24" role="img" aria-label="Warning:"><use xlink:href="#exclamation-triangle-fill"/></svg>`
                t.innerHTML= t.innerHTML+msg;
                t.className = 'alert alert-warning fixed-bottom m-0'
            break;
            case 4:
                t.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" style="display: none;">
                <symbol id="check-circle-fill" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z"/>
                </symbol>
                <symbol id="info-fill" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm.93-9.412-1 4.705c-.07.34.029.533.304.533.194 0 .487-.07.686-.246l-.088.416c-.287.346-.92.598-1.465.598-.703 0-1.002-.422-.808-1.319l.738-3.468c.064-.293.006-.399-.287-.47l-.451-.081.082-.381 2.29-.287zM8 5.5a1 1 0 1 1 0-2 1 1 0 0 1 0 2z"/>
                </symbol>
                <symbol id="exclamation-triangle-fill" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767L8.982 1.566zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5zm.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"/>
                </symbol>
                </svg>   <svg class="bi flex-shrink-0 me-2" width="24" height="24" role="img" aria-label="Warning:"><use xlink:href="#exclamation-triangle-fill"/></svg>`
                t.innerHTML= t.innerHTML+msg
                t.className = 'alert alert-danger fixed-bottom m-0'
            break;
            default:
        }
        document.body.appendChild(t);
        setTimeout(()=>document.body.removeChild(t),2000);
    }
}

