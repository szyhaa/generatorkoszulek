// defining html object constants
const $btnRandomImage     = document.querySelector('.btn__print--random')
    , $btnPreviousImage   = document.querySelector('.btn__print--previous')
    , $btnNextImage       = document.querySelector('.btn__print--next')

    , $btnSwitchSide      = document.querySelectorAll('.preview__switch')
    , $btnGoToStep        = document.querySelectorAll('.btn--goToStep')

    , $deliveryMethod     = document.querySelectorAll('.delivery__method')

    , $btnUseInvoiceAddr  = document.querySelector('.form__button--use_invoice_address')
    , $invoiceAddress     = document.querySelector('#form__invoice_address')
    , $deliveryAddress    = document.querySelector('#form__delivery_address')

// object constants
const product  = new Product()
    , orderForm     = new OrderForm()

// Generate an image on start
product.setRandomImage();

// Event listeners
$btnRandomImage.onclick       = ()=>{product.setRandomImage();}
$btnPreviousImage.onclick     = ()=>{product.setPreviousImage();}
$btnNextImage.onclick         = ()=>{product.setNextImage();}

// autofill delivery address data form with invoice address
$btnUseInvoiceAddr.onclick = ()=>{
  $invoiceAddress.querySelectorAll('input').forEach(field => {
    const fieldName = field.getAttribute('name')
        , fieldValue = field.value;

    $deliveryAddress.querySelector(`input[name="${fieldName}"]`).value = fieldValue;
  })

}

$btnSwitchSide.forEach(btn => {
  btn.onclick = function(){product.switchSide(this.dataset.side);}
})

$btnGoToStep.forEach(btn => {
  btn.onclick = function(){orderForm.goToStep(this.dataset.step)}
})

$deliveryMethod.forEach(item => {
  item.onclick = function(){
    orderForm.deliveryMethod = item.value
    product.includeShippingCosts = (item.value != "pickup");
    product.updatePrice();
  }
})

//
