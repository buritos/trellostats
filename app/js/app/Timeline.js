namespace('tstats.m');
tstats.m.Timeline = can.Model({
	init: function() {
		this.attr('states', new tstats.m.Map());
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