namespace('tstats.m');
tstats.m.List = can.Model({
	init: function() {
		this.attr('cards', new tstats.m.Map());
	},
	cardsCount: function() {
		return this.cards.count(tstats.m.TrueCounter);
	},
	initFromTrelloList: function(TrelloList) {
		this.attr('id', TrelloList.id);
		this.attr('name', TrelloList.name); 
	},
	addCard: function(CardCreated) { this.cards.attr(CardCreated.data.card.id, true); },
	removeCard: function(CardDeleted) { this.cards.removeAttr(CardDeleted.data.card.id); },
	archiveCard: function(CardArchived) { this.cards.attr(CardArchived.data.card.id, CardArchived.data.old.closed); }
});