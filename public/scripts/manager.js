const message = document.querySelector('#restock-amt');
const result = document.querySelector('#restock-price');


message.addEventListener('input', function () {
    if (this.value === ""){
        result.textContent = "0.00";
    }else{
        result.textContent = (parseFloat(this.value)*restock).toFixed(2);
    }
});