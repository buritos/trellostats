var session = session || {};
requirejs.config({ baseUrl: 'js/app' });
requirejs(['Map', 'Member', 'Board', 'List', 'Timeline', 'TrelloService', 'MemberControl', 'BoardsControl'], 
	function() {
		session.user = new model.Member();
		var memberControl = new control.Member('#member');
		var boardsControl = new control.Boards('#boards');
	}
);

