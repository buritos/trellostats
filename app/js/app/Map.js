var model = model || {};
model.Map = can.Model({
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