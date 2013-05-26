var control = control || {};
control.Member = can.Control({
	defaults: { view: 'memberEJS' }
},{
	'init': function(element, options) {
		this.element.html(can.view(this.options.view, session.user));
		var self = this;
		Trello.authorize({ interactive: false,
		    success: function () {
		    	self.onAuth();
		    	self.updateLoggedIn();
		    }
		});
		this.updateLoggedIn();
	},
	onAuth: function() {
		TrelloService.onUserLogin(session.user);
	},
	updateLoggedIn: function() {
		$(".logout").toggle(Trello.authorized());
		$(".login").toggle( ! Trello.authorized());
	},
	'.login click': function(el, ev) {
		ev.preventDefault();
		var self = this;
		Trello.authorize({
		    type: "popup",
		    name: "trellostats",
		    scope: {read: true, write: true, account: true},
		    success: function () {
		    	self.onAuth();
		    	self.updateLoggedIn();
		    }
		});
		this.updateLoggedIn();
	},
	'.logout click': function(el, ev) {
		ev.preventDefault();
		Trello.deauthorize();
		session.user.logout();
	    this.updateLoggedIn();
	}
});