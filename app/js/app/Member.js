namespace('tstats.m');
tstats.m.Member = can.Model({
	init: function() {
		this.attr('name', '');
		this.attr('boards', new tstats.m.Map());
	},
	login: function(UserLogin) {
		this.attr('id', UserLogin.id);
		this.attr('name', UserLogin.fullName);
		for (var i = 0 ; i < UserLogin.boards.length ; i++) {
			var board = new tstats.m.Board();
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
