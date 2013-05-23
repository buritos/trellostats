var app = app || {};
var model = model || {};

model.Member = can.Model({
	init: function() {
		this.attr('name', '');
	},
	login: function(UserLogin) {
		this.attr('id', UserLogin.id);
		this.attr('name', UserLogin.fullName);
	},
	logout: function() {
		this.removeAttr('id');
		this.attr('name', '');
	}
});

var session = session || {};

session.user = new model.Member();

var control = control || {};

control.Member = can.Control({
	defaults : { view : 'memberEJS' }
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
		Trello.members.get('me', {boards: 'all'}, function(member) {
			session.user.login(member);
		});
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







