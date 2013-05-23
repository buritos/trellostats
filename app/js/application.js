var model = model || {};

model.Member = can.Model({
	init: function() {
		this.attr('name', '');
		this.attr('boards', new can.Observe());
	},
	login: function(UserLogin) {
		this.attr('id', UserLogin.id);
		this.attr('name', UserLogin.fullName);
		
		var boardsIdMap = this.attr('boards');
		for (var i = 0 ; i < UserLogin.boards.length ; i++) {
			var board = new model.Board();
			board.initialize(UserLogin.boards[i]);
			boardsIdMap.attr(board.attr('id'), board);
		}
	},
	logout: function() {
		this.removeAttr('id');
		this.attr('name', '');
		var boards = this.attr('boards'); 
		boards.each(function (value, name) {
			boards.removeAttr(name);
		});
	}
});

model.Board = can.Model({
	initialize : function(Board) {
		this.attr('id', Board.id);
		this.attr('name', Board.name);
	}
});

var session = session || {};

session.user = new model.Member();

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

control.Boards = can.Control({
	defaults: { view: 'boardsEJS' }
},{
	'init': function(element, options) {
		this.element.html(can.view(this.options.view, session.user));
	}
});







