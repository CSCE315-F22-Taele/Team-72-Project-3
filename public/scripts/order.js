checkboxes = document.querySelectorAll(".checkbox-form input");

checkboxes.forEach(cb => {
    cb.addEventListener("change", () => {
        var itemName = cb.name;
        if (cb.checked) {
            // use itemName to find the price of the item and ADD it to price
        } else {
            // use itemName to find the price of the item and SUBTRACT it to price
        }
    });
});