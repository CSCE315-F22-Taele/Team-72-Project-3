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


// TODO
$(".item-button").on("click", function() {
    var itemName = console.log($(this).attr("name"));
    var itemPrice = console.log($(this).attr("price"));
    $('#item-list tr:last').after(`
        <tr>
            <td class="td-name">${itemName}</td>
            <td class="td-price">${itemPrice}</td>
        </tr>
    `);
});