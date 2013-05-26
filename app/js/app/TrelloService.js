var TrelloService = TrelloService || {};
(function(){
	this.onUserLogin = function(User) {
		function login(UserLogin) { User.login(UserLogin); }
		Trello.members.get('me', {boards: 'all'}, login);
	};
	this.loadListsForBoard = function(Board) {
		function initBoardLists(TrelloLists) { Board.initTrelloLists(TrelloLists); }
		Trello.get("boards/" + Board.id + "/lists", initBoardLists);
	};
	this.loadActionsForBoard = function(Board) {
		function invokeBoardActions(TrelloBoard) {
			var actions = _.reduceRight(TrelloBoard.actions, function(a,b) { a.push(b); return a; }, []);
			Board.invokeTrelloActions(actions);
		}
		Trello.boards.get(Board.id, {
			actions: 'createCard,deleteCard,updateCard', 
			actions_limit: 1000,
			actions_since: Board.timestamp.toISOString()
		}, invokeBoardActions);
	};
}).apply(TrelloService);