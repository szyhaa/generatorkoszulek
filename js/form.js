class OrderForm{
    constructor(){
        this.currentStep = "1";
        this.warningBox = document.querySelector('.warning');

        this.deliveryMethod = 'pickup';
    }

    /**
     * Go to step
     * Shows user previous / next step
     */
    goToStep(step){
        // if user wants to go to the next step, validate current step first
        if(step > this.currentStep && !this.validateForm(this.currentStep)) return;

        // hide any warning boxes
        this.warningBox.style.display = 'none';

        // everything's ok - proceed
        document.querySelectorAll('.step').forEach(step => {
            step.classList.remove('step--current');
        });

        // show desired step
        const stepClass = step.replace('.', '_');
        document.querySelector(`.step--${stepClass}`).classList.add('step--current');

        switch(step){
            case "4":
                if(this.currentStep == 3 && this.deliveryMethod == "delivery") {
                    this.goToStep('3.5');
                    return;
                }

                this.updateSummary();
            break;

            case "5":
                this.sendOrder();
            break;
        }

        this.currentStep = step;
    }
    
    /**
     * Validate Form
     * Validates current step, rejects on error, returns true on success
     */
    validateForm(step){
        // validate
        switch(step){
            case "1":
                // first step - let's see if user has chosen any image
                if(product.currentImage.front == '' && product.currentImage.back == ''){
                    this.warning('Nie wybrano żadnego obrazka');
                    return false;
                } else {
                    return true;
                }
            break;

            case '2': // invoice form
            case '3.5': // delivery form
                const formID = step == "2" ? "invoice_address" : "delivery_address"
                    , $form = document.querySelector('#form__' + formID)

                let emptyFields = false
                  , errors = [];

                // check for empty fields
                $form.querySelectorAll('input').forEach(field => {
                    const emptyField = field.value == '';

                    if(field.hasAttribute('required') && emptyField) {
                        field.style.borderColor = 'red';
                        emptyFields = true;
                    } else {
                        field.style.borderColor = 'initial';
                    }

                    let validateResult = this.validateField(field);

                    if(validateResult !== true) {
                        errors.push(validateResult);
                        field.style.borderColor = "red";
                    } else {
                        return true;
                    }
                });

                if(emptyFields) errors.push('Wypełnij wymagane pola');

                if(errors.length == 0) {
                    return true;
                } else {
                    this.warning(errors);
                    return false;
                }
            break;

            default: // steps that do not require validation
                return true;
            break;

        }
    }

    /**
     * Validate field
     * Validates given field, returns true on success, error text on error
     */
    validateField(field){
        const fieldName     = field.getAttribute("name")
            , fieldValue    = field.value;

        // do not validate if field is empty
        if(fieldValue == "") return true;

        let reg, errorText;

        switch(fieldName){
            case "email":
                reg = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
                errorText = "Podano niepoprawny adres E-Mail";
            break;

            case "phone":
                reg = /^[0-9\+]{8,13}$/;
                errorText = "Podano niepoprawny numer telefonu";
            break;

            case "postal_code":
                reg = /(\d{2})-(\d{3})/;
                errorText = "Podano niepoprawny kod pocztowy";
            break;

            default:
                return true;
        }

        if(fieldValue.toLowerCase().match(reg)) return true
        else return errorText;
    }

    /**
     * Update summary
     * Updates all summary information
     */
    updateSummary(){
        const $sumProduct           = document.querySelectorAll(".summary__product")
            , $sumInvoiceAddress    = document.querySelectorAll(".summary__invoice")
            , $sumDeliveryAddress   = document.querySelectorAll(".summary__delivery")
            , $sumDeliveryMethod    = document.querySelectorAll(".summary__delivery_method")

            , dataInvoiceAddress        = new FormData(document.querySelector("#form__invoice_address"))
            , dataDeliveryMethod        = new FormData(document.querySelector("#form__delivery_method"))
            , dataDeliveryAddress       = new FormData(document.querySelector("#form__delivery_address"))

        // Product
        let productInfo = 'Koszulka z nadrukiem';

        if(product.currentImage.front != '') productInfo += ' z przodu (+10§)';
        if(product.currentImage.back != '') productInfo += ', z tyłu (+10§)';
        
        $sumProduct.forEach(item => {
            item.innerHTML = productInfo;
        })

        // Invoice address
        const invoiceAddress = 
            `${dataInvoiceAddress.get('name')} ${dataInvoiceAddress.get('surname')}<br>
            ${dataInvoiceAddress.get('street')} ${dataInvoiceAddress.get('building')} ${dataInvoiceAddress.get('flat')}<br>
            ${dataInvoiceAddress.get('postal_code')} ${dataInvoiceAddress.get('city')}`;

        $sumInvoiceAddress.forEach(item => {
            item.innerHTML = invoiceAddress;
        });

        // Delivery method
        let deliveryMethod;

        switch(dataDeliveryMethod.get('delivery_method')){
            case "pickup":
                deliveryMethod = "Odbiór osobisty";
            break;
            
            case "delivery":
                deliveryMethod = "Dostawa kurierem (5§)";
            break;
        }
        
        $sumDeliveryMethod.forEach(item => {
            item.innerHTML = deliveryMethod;
        })

        // Invoice address
        if(dataDeliveryMethod.get('delivery_method') == "delivery"){
            const deliveryAddress = 
                `${dataDeliveryAddress.get('name')} ${dataDeliveryAddress.get('surname')}<br>
                ${dataDeliveryAddress.get('street')} ${dataDeliveryAddress.get('building')} ${dataDeliveryAddress.get('flat')}<br>
                ${dataDeliveryAddress.get('postal_code')} ${dataDeliveryAddress.get('city')}`;
    
                $sumDeliveryAddress.forEach(item => {
                    item.innerHTML = deliveryAddress;
                    item.parentNode.style.display = "block";
                });
        } else {
            $sumDeliveryAddress.forEach(item => {
                item.parentNode.style.display = "none";
            })
        }
    }

    /**
     * Warning
     * Shows a warning to the user
     * Expects a string or an array of strings
     */
    warning(text){
        if(typeof text == "object"){
            text = text.join('<br>');
        }

        this.warningBox.innerHTML = text;
        this.warningBox.style.display = 'block';
    }


    /**
     * Send order
     */
    sendOrder(){
        let invoiceAddress = new FormData(document.querySelector("#form__invoice_address"))
          , deliveryAddress = new FormData(document.querySelector("#form__delivery_address"));

        invoiceAddress = Object.fromEntries(invoiceAddress.entries());
        deliveryAddress = Object.fromEntries(deliveryAddress.entries())

        const orderData = {
                product: "T-Shirt"
              , overprint: product.currentImage
              , invoiceAddress: invoiceAddress
              , deliveryAddress: this.deliveryMethod == "delivery" ? deliveryAddress : null
              , deliveryMethod: this.deliveryMethod
        }

        console.log(orderData);
    }
}