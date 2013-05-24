var model = model || {};

model.Member = can.Model({
	init: function() {
		this.attr('name', '');
		this.attr('boards', new can.Observe());
	},
	login: function(UserLogin) {
		this.attr('id', UserLogin.id);
		this.attr('name', UserLogin.fullName);
		for (var i = 0 ; i < UserLogin.boards.length ; i++) {
			var board = new model.Board();
			board.initFromTrelloBoard(UserLogin.boards[i]);
			this.attr('boards')
				.attr(board.attr('id'), board);
		}
	},
	logout: function() {
		this.removeAttr('id');
		this.attr('name', '');
		var boards = this.attr('boards'); 
		boards.each(function (board, id) {
			boards.removeAttr(id);
		});
	}
});

model.Board = can.Model({
	init: function(){
		this.attr('name', '');
		this.attr('lists', new can.Observe());
	},
	initFromTrelloBoard : function(TrelloBoard) {
		this.attr('id', TrelloBoard.id);
		this.attr('name', TrelloBoard.name);
	}
});

model.List = can.Model({
	init: function() {
		this.attr('cardCount', 0);
	},
	initFromTrelloList: function(TrelloList) {
		this.attr('id', TrelloList.id);
		this.attr('name', TrelloList.name);
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
		Trello.members.get('me', {boards: 'all'}, function(UserLogin) {
			session.user.login(UserLogin);
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
	},
	'li a click': function(el, ev) {
		this.element.find('.selected').removeClass('selected');
		el.closest('li').addClass('selected');
		el.trigger('selected', el.data('board'));
	},
	'li a selected': function(el, ev, board) {
		Trello.get("boards/" + board.id + "/lists", function(TrelloLists) {
			for (var i = 0 ; i < TrelloLists.length ; i++) {
				var TrelloList = TrelloLists[i];
				var list = board.lists[TrelloList.id];
				if (_.isUndefined(list)) {
					list = new model.List();
					list.initFromTrelloList(TrelloList);
					board.lists.attr(list.id, list);
				}
				else {
					list.attr('name', TrelloList.name);
				}
			}
		});
	}
});








