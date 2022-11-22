var orderItems = [];

function clearLog() {
    orderItems = []
    $('#item-list').html("");
    $("#total-price").text("0.00");
}

$(".item-button").on("click", function() {
    var itemName = $(this).attr("name");
    var itemPrice = "$" + $(this).attr("price");

    if (itemPrice == "$0") {
        itemPrice = "";
    }
    
    var htmlRow = `
        <tr>
            <td class="td-name">${itemName}</td>
            <td class="td-price">${itemPrice}</td>
        </tr>
    `;
    var lastEntry = $('#item-list tr:last');
    if (lastEntry.length == 0) {
        $('#item-list').html(htmlRow);
    }
    else {
        $('#item-list tr:last').after(htmlRow);
    }

    var oldTotal = parseFloat($("#total-price").text());
    var itemPrice = parseFloat($(this).attr("price"));

    newTotal = oldTotal + itemPrice;
    
    $("#total-price").text(newTotal.toFixed(2));

    var itemId = $(this).attr("item-id");
    orderItems.push(itemId);
    console.log(orderItems);
});

$("#submit-button").on("click", function() {
    // TODO: add error handling for blank orders

    $.post("/customer", {orderItems: orderItems}).then(() => {
        clearLog();
        console.log("done!");
    });
    console.log("submit");
});

$("#cancel-button").on("click", function() {
    clearLog();
});