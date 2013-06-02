function namespace(namespaceString) {
	var parts = namespaceString.split('.'),
    parent = window,
    currentPart = '';    
    
	for(var i = 0, length = parts.length; i < length; i++) {
	    currentPart = parts[i];
	    parent[currentPart] = parent[currentPart] || {};
	    parent = parent[currentPart];
	}
	
	return parent;
};

requirejs.config({ baseUrl: 'js/app' });
requirejs(['Map', 'Member', 'Board', 'List', 'Timeline', 'TrelloService', 'MemberControl', 'BoardsControl', 'Router', 'TimelineControl'], 
	function() {
		tstats.user = new tstats.m.Member();
		new tstats.c.Router(document.body);
	}
);

