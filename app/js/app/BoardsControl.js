namespace('tstats.c');
tstats.c.Boards = can.Control({
	defaults: { view: 'boardsEJS' }
},{
	'init': function(element, options) {
		this.element.html(can.view(this.options.view, tstats.user));
	},
	'li a click': function(el, ev) {
		ev.preventDefault();
		this.element.find('.selected').removeClass('selected');
		el.closest('li').addClass('selected');
		el.trigger('selected', el.data('board'));
	},
	'li a selected': function(el, ev, board) {
		tstats.TrelloService.loadListsForBoard(board);
		can.route.attr('id', board.id);
	}
});