namespace('tstats.m');
tstats.m.Board = can.Model({
	init: function(){
		this.attr('name', '');
		this.attr('lists', new tstats.m.Map);
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
				list = new tstats.m.List();
				list.initFromTrelloList(TrelloList);
				this.lists.attr(list.id, list);
			}
			else {
				list.attr('name', TrelloList.name);
			}
		}
	},
	copy: function() {
		var board = new tstats.m.Board();
		board.initFromTrelloBoard(this);
		board.initTrelloLists(_.toArray(this.lists.attr()));
		var lists = this.lists;
		function copyCards(list, k) { list.attr('cards', $.extend(true, new tstats.m.Map(), lists[k].cards)); }
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
			if (_.has(this[TrelloAction.type])) {
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
		return this.lists.count(tstats.m.IdCounter);
	},
	cardsCount: function() {
		function counter(n,o) {
			var cards = new tstats.m.Map(o.cards);
			return n + cards.count(tstats.m.TrueCounter); 
		} 
		return this.lists.count(counter);
	}
});