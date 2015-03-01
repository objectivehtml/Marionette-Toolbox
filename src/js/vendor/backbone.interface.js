(function() {

	/* Backbone Interfaces consist of two components. 
	 * 
	 * 1) Interfaces allow you to implement structural
	 *    classes to provide boilerplate methods to 
	 *    classes.
	 *
	 * 2) Abstracts are just like interfaces except
	 *    they allow you to define boilerplate logic
	 *	  within the methods.
	 *
	 * Technically, Interfaces and Abstracts are the same, so it's
	 * important to know that this is merely a symmantic and 
	 * organizational difference.
	 */

	// Define blank Backbone.Interface class
	Backbone.Interface = function() {};

	// Define blank Backbone.Abstract class
	Backbone.Abstract = function() {};
		
	// Assign the extend method to Backbone.Interface
	Backbone.Interface.extend = Backbone.Model.extend;

	// Assign the extend method to Backbone.Abstract
	Backbone.Abstract.extend = Backbone.Model.extend;

	// A local method to extend the prototype
	function implements(Interface) {
		this.prototype = _.extend({}, Interface.prototype, this.prototype);
	}

	// Set up inheritance for the model, collection, router, view and history.
	Backbone.Interface.implements = Backbone.Abstract.implements = Backbone.Model.implements = Backbone.Collection.implements = Backbone.Router.implements = Backbone.View.implements = Backbone.History.implements = implements;

	// Alias for 'implements'. Some people prefer 'implement'
	Backbone.Interface.implement = Backbone.Abstract.implement = Backbone.Model.implement = Backbone.Collection.implement = Backbone.Router.implement = Backbone.View.implement = Backbone.History.implement = implements;

}());