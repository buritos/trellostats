namespace('tstats.c');
tstats.c.Router = can.Control({
	'init': function(el) {
		this.login = new tstats.c.Member('#member');
		this.boards = new tstats.c.Boards('#boards');
		this.chart = new tstats.c.Timeline('#chart');
	},
	'boards/:id route' : function(data) {
		
	},
	'li a selected': function(el, ev, data) {
		this.chart.clearView();
		this.chart.timeline(data);
	},
	'.logout logout': function(el, ev, data) {
		this.chart.clearState();
	}
});