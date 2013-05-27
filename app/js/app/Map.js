namespace('tstats.m');
tstats.m.Map = can.Model({
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

tstats.m.IdCounter = function(memo,o) { return memo + 1; };
tstats.m.BooleanCounter = function(b,memo,o) { return memo + ( (b===o)?1:0 ); };
tstats.m.TrueCounter = _.partial(tstats.m.BooleanCounter, true);