checkboxes = document.querySelectorAll(".checkbox-form input");

const totalPrice = document.querySelector("#total-price");

checkboxes.forEach(cb => {
    cb.addEventListener("change", () => {
        var oldTotal = parseFloat(totalPrice.textContent);
        var itemPrice = parseFloat(cb.getAttribute("price"));
        var newTotal = 0;

        if (cb.checked) { 
            newTotal = oldTotal + itemPrice;
        } else {
            newTotal = oldTotal - itemPrice;
        }

        totalPrice.textContent = newTotal.toFixed(2);
    });
});