var control = control || {};
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