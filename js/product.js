class Product {
  constructor(){
    this.randomImageUrl = "https://picsum.photos/200/200";

    this.currentImage   = {front: '', back: ''};
    this.previousImage  = {front: '', back: ''};
    this.nextImage      = {front: '', back: ''};

    this.currentPrice   = 0;
    this.currentSide    = "front";

    this.includeShippingCosts = false;
    this.shippingCost         = 5;
  }

  /**
   * Set random image
   * Gets a random image for picsum and sets it on tshirt
   */
  async setRandomImage(){
    const response = await fetch(this.randomImageUrl, {
      method: "GET"
      , mode: "cors"
      , cache: 'no-cache'
      , redirect: "follow"
    });
  
    this.previousImage[this.currentSide] = this.currentImage[this.currentSide];
    this.currentImage[this.currentSide] = response.url;
    this.nextImage[this.currentSide] = '';
    
    this.setImage(response.url);
    this.setButtonStates();
    this.updatePrice();
  }

  /**
   * Set image
   * Sets an image from a given url on the current chosen side of the tshirt
   */
  setImage(url){
    const $frontImage = document.querySelector(`.preview__side--${this.currentSide} img`);
  
    $frontImage.src = url;
  }

  /**
   * Set previous image
   * Self explainatory :)
   */
  setPreviousImage(){
    this.nextImage[this.currentSide] = this.currentImage[this.currentSide];
    this.currentImage[this.currentSide] = this.previousImage[this.currentSide];
    this.previousImage[this.currentSide] = '';
    
    this.setImage(this.currentImage[this.currentSide]);

    this.setButtonStates();
  }

  /**
   * Set next image
   */
  setNextImage(){
    this.previousImage[this.currentSide] = this.currentImage[this.currentSide];
    this.currentImage[this.currentSide] = this.nextImage[this.currentSide];
    this.nextImage[this.currentSide] = '';
    
    this.setImage(this.currentImage[this.currentSide]);

    this.setButtonStates();
  }

  /**
   * Looks at current image object and sets adequate button states
   */
  setButtonStates(){
    const $btnPreviousImage = document.querySelector('.btn__print--previous')
        , $btnNextImage     = document.querySelector('.btn__print--next');

    $btnPreviousImage.disabled  = this.previousImage[this.currentSide] == '';
    $btnNextImage.disabled      = this.nextImage[this.currentSide] == '';
  }

  /**
   * Switch side
   * Switches tshirt side on the preview
   * excpects a "front" or "back" string  
   */
  switchSide(side){
    document.querySelectorAll(".preview__side").forEach(side => {
      side.style.display = "none";
    })

    document.querySelectorAll(".preview__switch").forEach(button => {
      button.classList.remove('preview__switch--selected')
    });

    document.querySelector(`.preview__switch[data-side="${side}"]`).classList.add("preview__switch--selected");

    document.querySelector(".preview__side--" + side).style.display = "block";

    this.currentSide = side;
    this.setButtonStates();
  }


  /**
   * Update price
   * Updates current price 
   */
  updatePrice(){
    this.currentPrice = this.includeShippingCosts ? this.shippingCost : 0;
    this.currentPrice += this.currentImage.front != "" ? 10 : 0;
    this.currentPrice += this.currentImage.back != "" ? 10 : 0;

    document.querySelector('.product__price').innerHTML = parseFloat(this.currentPrice).toFixed(2);
  }
}
