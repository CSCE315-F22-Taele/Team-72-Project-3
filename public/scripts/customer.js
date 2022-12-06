var orderItems = [];
var itemCount = 0;

function clearLog() {
    orderItems = []
    $('#item-list').html("");
    $("#total-price").text("0.00");
}

$(".item-button:not(.out-of-stock)").on("click", function() {
    var itemName = $(this).attr("name");
    var itemPrice = "$" + $(this).attr("price");

    if (itemPrice == "$0") {
        itemPrice = "";
    }
    
    var htmlRow = `
        <tr id="item-${itemCount}" price="${itemPrice}">
            <td class="td-name">${itemName}</td>
            <td class="td-price">${itemPrice}</td>
            <td class="remove-button-column"><div class="remove-button" id="button-${itemCount}">X</div></td>
        </tr>
    `;

    var lastEntry = $('#item-list tr:last');
    if (lastEntry.length == 0) {
        $("#item-list").css("color", "white");
        $('#item-list').html(htmlRow);
    }
    else {
        $('#item-list tr:last').after(htmlRow);
    }

    var oldTotal = parseFloat($("#total-price").text());
    var itemPrice = parseFloat($(this).attr("price"));
    var newTotal = oldTotal + itemPrice;
    $("#total-price").text(newTotal.toFixed(2));

    var itemId = $(this).attr("item-id");
    orderItems.push(itemId);
    console.log(orderItems);

    // event listener for button
    $(`#button-${itemCount}`).on("click", function () {
        var itemNum = $(this).attr("id").split("-")[1];
        var tableRow = $(`#item-${itemNum}`);

        var oldTotal = parseFloat($("#total-price").text());
        var newTotal = oldTotal - itemPrice;
        $("#total-price").text(newTotal.toFixed(2));

        var index = orderItems.indexOf(itemId);
        orderItems.splice(index, 1);
        console.log(orderItems);

        tableRow.remove();
        itemCount--;
    });

    itemCount++;
});

$("#submit-button").on("click", function() {
    // TODO: add error handling for blank orders
    if (orderItems.length == 0) {
        var text = $("#item-list").text("Error: You have not added any items to your order.");
        text.css("color", "red");
        return;
    }

    $.post("/customer", {orderItems: orderItems}).then(() => {
        clearLog();
        console.log("done!");
    });
    console.log("submit");
});

$("#cancel-button").on("click", function() {
    clearLog();
});