var orderItems = [];
var itemCount = 0;

// clears the customer order log panel
function clearLog() {
    orderItems = []
    $("#confirm-message").text("");
    $("#error-message").text("");
    $('#item-list').html("");
    $("#total-price").text("0.00");
}

// event listener for item buttons
$(".item-button:not(.out-of-stock)").on("click", function() {
    // get data about item that has been clicked
    var itemName = $(this).attr("name");
    var itemPrice = "$" + $(this).attr("price");

    // do not display
    if (itemPrice == "$0") {
        itemPrice = "";
    }
    
    // markup for table row
    var htmlRow = `
        <tr id="item-${itemCount}" price="${itemPrice}">
            <td class="td-name">${itemName}</td>
            <td class="td-price">${itemPrice}</td>
            <td class="remove-button-column"><div class="remove-button" id="button-${itemCount}">X</div></td>
        </tr>
    `;

    // add table row to bottom of table
    var lastEntry = $('#item-list tr:last');    // last row of table
    if (lastEntry.length == 0) {    // set inner html to row if there are no other rows
        clearLog();
        $('#item-list').html(htmlRow);
    }
    else {      // otherwise append to table
        $('#item-list tr:last').after(htmlRow);
    }

    // update order total
    var oldTotal = parseFloat($("#total-price").text());
    var itemPrice = parseFloat($(this).attr("price"));
    var newTotal = oldTotal + itemPrice;
    $("#total-price").text(newTotal.toFixed(2));

    // update item list
    var itemId = $(this).attr("item-id");
    orderItems.push(itemId);

    // event listener for remove button
    $(`#button-${itemCount}`).on("click", function () {
        // find table row corresponding to the remove button
        var itemNum = $(this).attr("id").split("-")[1];
        var tableRow = $(`#item-${itemNum}`);

        // update total when item is removed
        var oldTotal = parseFloat($("#total-price").text());
        var newTotal = oldTotal - itemPrice;
        $("#total-price").text(newTotal.toFixed(2));

        // remove item id from list
        var index = orderItems.indexOf(itemId);
        orderItems.splice(index, 1);

        // remove row from html table
        tableRow.remove();
        itemCount--;
    });

    itemCount++;
});

$("#submit-button").on("click", function() {
    // submit post request to backend
    $.post("/customer", {orderItems: orderItems}).then((data) => {
        clearLog();
        
        // display resulting message to the user
        if (data.errMsg != "") {    // order resulted in error
            $("#error-message").text(data.errMsg);
        }
        else {      // order was successful
            $("#confirm-message").text(`Order Complete! Your order number is ${data.orderId}.`);
        }
    });
});

// event listener for cancel button
$("#cancel-button").on("click", function() {
    clearLog();
});