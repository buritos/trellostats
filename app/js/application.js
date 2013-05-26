var model = model || {};

model.IdMap = can.Model({
	count: function(counter) {
		return _.reduce(this.attr(), counter, 0);
	},
	removeAll: function() {
		var self = this;
		this.each(function(v, k) {
			self.removeAttr(k);
		});
	}
});

model.IdCounter = function(memo,o) { return memo + 1; };
model.BooleanCounter = function(b,memo,o) { return memo + ( (b===o)?1:0 ); };
model.TrueCounter = _.partial(model.BooleanCounter, true);

model.Member = can.Model({
	init: function() {
		this.attr('name', '');
		this.attr('boards', new model.IdMap());
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
		this.attr('boards').removeAll(); 
	}
});

model.Board = can.Model({
	init: function(){
		this.attr('name', '');
		this.attr('lists', new model.IdMap);
		this.attr('timestamp', new Date(0));
	},
	initFromTrelloBoard: function(TrelloBoard) {
		this.attr('id', TrelloBoard.id);
		this.attr('name', TrelloBoard.name);
	},
	initTrelloLists: function(TrelloLists) {
		for (var i = 0 ; i < TrelloLists.length ; i++) {
			var TrelloList = TrelloLists[i];
			var list = this.lists[TrelloList.id];
			if (_.isUndefined(list)) {
				list = new model.List();
				list.initFromTrelloList(TrelloList);
				this.lists.attr(list.id, list);
			}
			else {
				list.attr('name', TrelloList.name);
			}
		}
	},
	copy: function() {
		var board = new model.Board();
		board.initFromTrelloBoard(this);
		board.initTrelloLists(_.toArray(this.lists.attr()));
		var lists = this.lists;
		function copyCards(list, k) { list.attr('cards', $.extend(true, new model.IdMap(), lists[k].cards)); }
		board.lists.each(copyCards);
		return board;
	},
	
	invokeTrelloActions: function(TrelloActions) {
		for (var i = 0 ; i < TrelloActions.length ; i++){
			this.invokeTrelloAction(TrelloActions[i]);
		}
	},
	invokeTrelloAction: function(TrelloAction) {
		var t = new Date(TrelloAction.date);
		if (this.timestamp < t) {
			if ( ! _.isUndefined(this[TrelloAction.type])) {
				this[TrelloAction.type](TrelloAction);
				this.attr('timestamp', t);
			}
		}
		else {
			throw "action replay on board <" + this.id + ">";
		}
	},
	
	createCard: function(CardCreated) { 
		this.lists[CardCreated.data.list.id].addCard(CardCreated);
	},
	deleteCard: function(CardDeleted) { 
		this.lists[CardDeleted.data.list.id].removeCard(CardDeleted);
	},
	updateCard: function(CardUpdated) {
		var cardId = CardUpdated.data.card.id;
		var isArchived = CardUpdated.data.old.closed;
		if ( ! _.isUndefined(isArchived)) {
			this.lists.each(function(list){
				if ( ! _.isUndefined(list.cards[cardId])) {
					list.archiveCard(CardUpdated);
				}
			});
		}
		if ( ! _.isUndefined(CardUpdated.data.listBefore)) {
			this.lists[CardUpdated.data.listBefore.id].removeCard(CardUpdated);
			this.lists[CardUpdated.data.listAfter.id].addCard(CardUpdated);
		}
	},
	moveCardFromBoard: function(CardMovedFromBoard) { /* TODO */ },
	moveCardToBoard: function(CardMovedToBoard) { /* TODO */ },
	moveListFromBoard: function(ListMovedFromBoard) { /* TODO */ },
	moveListToBoard: function(ListMovedToBoard) { /* TODO */ },
	
	listsCount: function() {
		return this.lists.count(model.IdCounter);
	},
	cardsCount: function() {
		function counter(n,o) {
			var cards = new model.IdMap(o.cards);
			return n + cards.count(model.TrueCounter); 
		} 
		return this.lists.count(counter);
	}
});

model.List = can.Model({
	init: function() {
		this.attr('cards', new model.IdMap());
	},
	cardsCount: function() {
		return this.cards.count(model.TrueCounter);
	},
	initFromTrelloList: function(TrelloList) {
		this.attr('id', TrelloList.id);
		this.attr('name', TrelloList.name); 
	},
	addCard: function(CardCreated) { this.cards.attr(CardCreated.data.card.id, true); },
	removeCard: function(CardDeleted) { this.cards.removeAttr(CardDeleted.data.card.id); },
	archiveCard: function(CardArchived) { this.cards.attr(CardArchived.data.card.id, CardArchived.data.old.closed); }
});

model.Timeline = can.Model({
	init: function(Board) {
		this.attr('board', Board);
		this.attr('states', new model.IdMap());
	},
	append: function(TrelloActions) {
		var reverse = _.reduceRight(TrelloActions, function(a,b) { a.push(b); return a; }, []);
		var byDate = _.groupBy(reverse, function(a) { return new Date(a.date).toDateString(); });
		var sorted = _.sortBy(byDate, function(v,k) { return new Date(k).getTime(); });
		for (var i = 0 ; i < sorted.length ; i++) {
			var actions = sorted[i];
			var k = new Date(_.first(actions).date).toDateString();
			if ( ! _.has(this.states, k)) {
				this.states.attr(k, this.board.copy());
			}
			this.board.invokeTrelloActions(actions);
			this.states[k].invokeTrelloActions(actions);
		}
	}
});

var TrelloService = TrelloService || {};
(function(){
	this.onUserLogin = function(User) {
		function login(UserLogin) { User.login(UserLogin); }
		Trello.members.get('me', {boards: 'all'}, login);
	};
	this.loadListsForBoard = function(Board) {
		function initBoardLists(TrelloLists) { Board.initTrelloLists(TrelloLists); }
		Trello.get("boards/" + Board.id + "/lists", initBoardLists);
	};
	this.loadActionsForBoard = function(Board) {
		function invokeBoardActions(TrelloBoard) {
			var actions = _.reduceRight(TrelloBoard.actions, function(a,b) { a.push(b); return a; }, []);
			Board.invokeTrelloActions(actions);
		}
		Trello.boards.get(Board.id, {
			actions: 'createCard,deleteCard,updateCard', 
			actions_limit: 1000,
			actions_since: Board.timestamp.toISOString()
		}, invokeBoardActions);
	};
}).apply(TrelloService);

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
		TrelloService.loadListsForBoard(board);
	}
});








