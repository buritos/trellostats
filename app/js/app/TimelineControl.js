namespace('tstats.c');
tstats.c.Timeline = can.Control({
	'init': function() {
		this.series = {};
	},
	timeline: function(board) {
		this.options.timeline = new tstats.m.Timeline({board: board});
		this.on();
		var self = this;
		Trello.boards.get(
			board.id, 
			{
				actions: 'createList,createCard,deleteCard,updateCard,moveCardFromBoard,moveCardToBoard', 
				actions_limit: 1000,
				actions_since: board.timestamp.toISOString()
			}, 
			function(TrelloBoard) {
				var t = self.options.timeline;
				globalT = t;
				t.append(TrelloBoard.actions);
				
				var series = {};
				if (_.has(self.series, board.id)) {
					series = self.series[board.id];
				}
				else {
					self.series[board.id] = series;
				}
				var keys = _.map(t.states.attr(), function(v,k) { return k; });
				function time(v) { return new Date(v).getTime(); }
				var ordered = _.sortBy(keys, time);
				_.each(ordered, function(key) {
					var b = t.states[key];
					if (_.isUndefined(series.total)) {
						series.total = {};
						series.total.id = b.id; 
						series.total.name = 'total';
						series.total.data = [];
					}
					series.total.data.push({
						x: b.timestamp.getTime(),
						y: b.cardsCount()
					});
					b.lists.each(function(l) {
						if (_.isUndefined(series[l.id])) {
							series[l.id] = {};
							series[l.id].id = l.id; 
							series[l.id].name = l.name;
							series[l.id].data = [];
						}
						series[l.id].data.push({
							x: b.timestamp.getTime(),
							y: l.cardsCount()
						});
					});
				});
				$(self.element).highcharts({
					chart: { zoomType: 'x' },
					credits: { enabled: false },
					title: { text: ''},
					xAxis: { type: 'datetime' },
					yAxis: { 
						title: { text: '# cards' },
						lineWidth: 1
					},
			        series: _.map(series, function(v,k) { return v; }),
			        tooltip: { shared: true, crosshairs: true },
			        legend: {
			        	y: 14,
			            padding: 12,
			            itemMarginTop: 5,
			            itemMarginBottom: 5,
			            itemStyle: {
			            	lineHeight: '14px'
			            }
			        }
			    });
			}
		);
	},
	clearState: function() {
		this.series = {};
		this.clearView();
	},
	clearView: function() {
		if ( ! _.isUndefined($(this.element).highcharts()))
			$(this.element).highcharts().destroy();
	}
});







