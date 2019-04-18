//dependencies
var mysql = require("mysql");
var inquirer = require("inquirer");
var Table = require("cli-table");

//mysql database connection setup
var connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "bamazon_db",
  port: 3306
});

connection.connect();

//main function for application
var display = function() {
	var query = "Select * FROM products";
	connection.query(query, function(err, res){
		if(err) throw err;
		var displayTable = new Table ({
			head: ["Item ID", "Product Name", "Category", "Price", "Quantity"],
		});
		for(var i = 0; i < res.length; i++){
			displayTable.push([res[i].item_id,res[i].product_name, res[i].department_name, res[i].price, res[i].stock_quantity]);
		}
		console.log(displayTable.toString());
		purchase();
	});
}
var purchase = function() {
  inquirer
    .prompt({
      name: "productToBuy",
      type: "input",
      message: "Please enter the Item ID of the item you wish to purchase "
    })
    .then(function(answer1) {
      var selection = answer1.productToBuy;
      connection.query("SELECT * FROM products WHERE item_id=?", selection, function(err,res){
        if (err) throw err;
        if (res.length === 0) {
          console.log("Product does not exist. Please enter valid Item ID.");

          purchase();
        } else {
          inquirer.prompt({
              name: "quantity",
              type: "input",
              message: "How many items would you like to purchase?"
            }).then(function(answer2) {
              var quantity = answer2.quantity;
              if (quantity > res[0].stock_quantity) {
                console.log(
                  "Sorry. we only have " +res[0].stock_quantity + " items left for sale...");
				purchase();
              } else {
				console.log("");
                console.log(quantity + " items for $" + res[0].price + " each");
                var updatedQuantity = res[0].stock_quantity - quantity;
                connection.query("UPDATE products SET stock_quantity = " + updatedQuantity + " WHERE item_id = " + res[0].item_id, function(err, resUpdate) {
                    if (err) throw err;
                    console.log("");
                    console.log("Thank you, your order has been processed!");
                    connection.end();
                  }
                );
              }
            });
        }
      });
    });
};

display();