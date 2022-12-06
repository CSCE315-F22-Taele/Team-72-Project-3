const message = document.querySelector('#restock-amt');
const result = document.querySelector('#restock-price');


message.addEventListener('input', function () {
    if (this.value === "" || this.value[0] === "-"){
        result.textContent = "0.00";
    }else{
        result.textContent = (parseFloat(this.value)*restockp).toFixed(2);
    }
});