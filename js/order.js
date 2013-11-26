$(function() {
	var containerMeat = $("#meat-container");
	var containerVeg = $("#veg-container");
	var instance;
	$.each(com.dawgpizza.menu.pizzas, function() {
		instance = $("#template-pizza").clone()
		if (!this.vegetarian) {
			appendPizza(this, containerMeat, instance);
		} else {
			appendPizza(this, containerVeg, instance);
		}
	});


	var containerDrinks = $("#template-drinks").parent();
	var instance;
	$.each(com.dawgpizza.menu.drinks, function() {
		//Create a new drink and set it's name
		instance = $("#template-drinks").clone();
		instance.find("h4").html(this.name);

		//Set the button's data type, name, and price
		var btn = instance.find("button");
		btn.attr("data-type", this.type);
		btn.attr("data-name", this.name);
		btn.attr("data-price", this.price);
		btn.html("$" + this.price);

		//Make template visible and add it to the page
		instance.removeClass("js-template");
		containerDrinks.append(instance);
	});


	var containerDesserts = $("#template-desserts").parent();
	var instance;
	$.each(com.dawgpizza.menu.desserts, function() {
		//Create a new dessert and set it's name
		instance = $("#template-desserts").clone();
		instance.find("h4").html(this.name);

		//Set the button's data type, name, and price
		var btn = instance.find("button");
		btn.attr("data-type", this.type);
		btn.attr("data-name", this.name);
		btn.attr("data-price", this.price);
		btn.html("$" + this.price);

		//Make template visible and add it to the page
		instance.removeClass("js-template");
		containerDesserts.append(instance);
	});


	//If address has been saved, populate the field
    if (localStorage.getItem("address") != null) {
    	$(".cart-form").find("input[name='address']").val(localStorage.getItem("address"));
    }

	//create a cart model as a simple object with
    //the properties we eventually need to post to
    //the server
    var cart = {
        name: null,
        address1: null,
        zip: null,
        phone: null,
        items: [] //empty array
    }; //cart data

    //click event handler for all buttons with the
    //style class 'add-to-cart'
    $('.add-to-cart').click(function(){
        //use the attributes on the button to construct
        //a new cart item object that we can add to the
        //cart's items array
        var newCartItem = {
            type: this.getAttribute('data-type'),
            name: this.getAttribute('data-name'),
            size: this.getAttribute('data-size'),
            price: this.getAttribute('data-price'),
            index: cart.items.length
        };

        //push the new item on to the items array
        cart.items.push(newCartItem);

        //render the cart's contents to the element
        //we're using to contain the cart information
        //note that you would need a <div> or some
        //other grouping element on the page that has a
        //style class of 'cart-container'
        renderCart(cart, $('.cart-container'));
    });

    $('.place-order').click(function(){
        
        //TODO: validate the cart to make sure all the required
        //properties have been filled out, and that the 
        //total order is greater than $20 (see homework 
        //instructions)

		//Reset warning messages
    	$("#warning-fields").addClass("js-template");
    	$("#warning-cost").addClass("js-template");
    	$("#warning-cost").removeClass("error-text");
    	$("#warning-cost").removeClass("error-text");

    	var fieldErrors = false;

    	//Make sure name field has been filled out
    	var formName = $(".cart-form").find("input[name='name']");
    	formName.removeClass("error");
      	if (formName.val().length == 0) {
    		fieldErrors = true;
    		formName.addClass("error");
    	}

    	//Make sure address field has been filled out
    	var formAddress = $(".cart-form").find("input[name='address']");
    	formAddress.removeClass("error");
      	if (formAddress.val().length == 0) {
    		fieldErrors = true;
    		formAddress.addClass("error");
    	}

    	//Make sure zip field has been filled out
    	var formZip = $(".cart-form").find("input[name='zip']");
    	formZip.removeClass("error");
      	if (formZip.val().length == 0) {
    		fieldErrors = true;
    		formZip.addClass("error");
    	}

    	//Make sure phone field has been filled out
		var formPhone = $(".cart-form").find("input[name='phone']");
    	formPhone.removeClass("error");
      	if (formPhone.val().length == 0) {
    		fieldErrors = true;
    		formPhone.addClass("error");
    	}

    	var cost = 0;
    	for (var i = 0; i < cart.items.length; i++) {
    		var item = cart.items[i];
    		cost += item.price;
    	}


    	if (fieldErrors) {
    		$("#warning-fields").removeClass("js-template");
    		$("#warning-fields").addClass("error-text");
    	} else if (cost <= 20) {
    		$("#warning-cost").removeClass("js-template");
    		$("#warning-cost").addClass("error-text");
    	} else {
    		//Input fields are valid, set cart object properties
    		cart.name = formName.val();
    		cart.address1 = formAddress.val();
    		cart.zip = formZip.val();
    		cart.phone = formPhone.val();

    		//store address and last order in local storage
			localStorage.setItem("address", formAddress.val());
			localStorage.setItem("lastOrder", JSON.stringify(cart));

			//submit the cart through a post
        	postCart(cart, $('.cart-form'));
    	}
    });

	//Load the last ordered cart
	$(".load-last-order").click(function() {
		var saved = localStorage.getItem("lastOrder");
		cart.items = JSON.parse(saved).items;
        renderCart(cart, $('.cart-container'));
	});
});

function appendPizza(thisTemp, container, instance) {
	//Set the displayed pizza name and description
	instance.find("h4").html(thisTemp.name);
	instance.find("div").html(thisTemp.description);

	//Set all three buttons' data type and name
	var btn = instance.find("button");
	btn.attr("data-type", thisTemp.type);
	btn.attr("data-name", thisTemp.name);

	//Set the small-pizza button's price and name
	var btnSmall = instance.find("button#pizza-small")
	btnSmall.attr("data-price", thisTemp.prices[0]);
	btnSmall.html("Small $" + thisTemp.prices[0]);

	//Set the medium-pizza button's price and name
	var btnMedium = instance.find("button#pizza-medium")
	btnMedium.attr("data-price", thisTemp.prices[1]);
	btnMedium.html("Medium $" + thisTemp.prices[1]);

	//Set the large-pizza button's price and name
	var btnLarge = instance.find("button#pizza-large")
	btnLarge.attr("data-price", thisTemp.prices[2]);
	btnLarge.html("Large $" + thisTemp.prices[2]);

	//Make template visible and add it to the page
	instance.removeClass("js-template");
	container.append(instance);
}

// renderCart()
// renders the current cart information to the screen
// parameters are:
//  - cart (object) reference to the cart model
//  - container (jQuery object) reference to the container <div>
function renderCart(cart, container) {
    var idx, item;
    
    //empty the container of whatever is there currently
    container.empty();

    //for each item in the cart...
    var instance;
    var subTotal = 0;
    var str;
    for (idx = 0; idx < cart.items.length; ++idx) {
        item = cart.items[idx];
        subTotal += +item.price; //Unary operator convert to int
        instance = $("#template-cart-item").clone();

        //Concatenate display string
        str = item.name + " (";
        if (item.size != null) {
        	str += item.size + " - ";
        }
        str += "$" + item.price + ")";

		//Display the cart item
        instance.html("<img src=img/x.png>" + str);
		var tempImg = instance.find("img");
		tempImg.attr("data-index", idx);
		tempImg.addClass("delete-me");

        instance.removeClass("js-template");
		container.append(instance);

		//Delete item from cart
		$(".delete-me").click(function() {
		    var idxToRemove = +(this.getAttribute('data-index'));
		    cart.items.splice(idxToRemove, 1);
	        renderCart(cart, $('.cart-container'));
		});
    } //for each cart item


    $("#cart-sub-total").html("Sub-Total: $" + subTotal);
    var tax = (subTotal * .095).toFixed(2);
    $("#cart-tax").html("Tax: $" + tax);
    $("#cart-total").html("Total: $" + (+subTotal + +tax)); //Unary operators convert to int
} //renderCart()

// postCart()
// posts the cart model to the server using
// the supplied HTML form
// parameters are:
//  - cart (object) reference to the cart model
//  - cartForm (jQuery object) reference to the HTML form
//
function postCart(cart, cartForm) {
    //find the input in the form that has the name of 'cart'    
    //and set it's value to a JSON representation of the cart model
    cartForm.find('input[name="cart"]').val(JSON.stringify(cart));

    //submit the form--this will navigate to an order confirmation page
    cartForm.submit();

} //postCart()