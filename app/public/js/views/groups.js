var gc = new GroupController();	
var groupsModel = new GroupsModel();

$(document).ready(function(){

	groupsModel.init();
	gc.initBindings();
})

function GroupsModel () {
	return {
		element: null,
		init: function() {
			var self = this;
			self.element = '#groupContent';
			gc.getGroups();
		},

		render: function(list) {
			var self = this;
			$(self.element).empty();
			if (list && list.length > 0) {				
				$.each(list, function(i, item) {
					var grDiv = document.createElement('div');
					$(grDiv).addClass('groupContainer')
							.addClass('well')							
							.appendTo($(self.element));
					var grpBar = document.createElement('div');
					$(grpBar).addClass('btn-group')				
						.appendTo($(grDiv));
					var grpName = document.createElement('span');
					$(grpName).addClass('groupItem')
						.addClass('btn-info')	
						.addClass('btn')
						.addClass('btn-link')						
						.width('250')
						.data('id', item._id)
						.text(item.name)
						.appendTo($(grpBar));
					var favLink = document.createElement('a');					
					var favLinkClass = (item.default == 1 ? 'btn-warning' : '');					
					$(favLink).addClass('btn')
						.addClass('favLinkButton')
						.addClass(favLinkClass)
						.attr('href', '#')
						.attr('title', (item.default == 1 ? 'Click to remove as Default' : 'Click to set as Default'))
						.attr('data-id', item._id)
						.attr('data-isdefault', item.default)
						.appendTo($(grpBar));
					var iconFav = document.createElement('i');
					$(iconFav).addClass('icon-heart')
						.addClass(item.default == 1 ? 'icon-white' : '')
						.appendTo($(favLink));
					var butn = 	document.createElement('button');
					$(butn).addClass('btn-danger')
							.addClass('btn')
							.addClass('pull-right')
							.addClass('deleteGroup')
							.data('id', item._id)
							.appendTo($(grpBar));
					var icon = document.createElement('i');
					$(icon).addClass('icon-minus')
						.appendTo($(butn));
					var span = document.createElement('span');
					$(span).text('Remove')
						.appendTo($(butn));						

						
	
						
				});
			} else {
				$(self.element).append('<p class="subheading"> Create a group below </p>');
			} 

		},	
	}

};
function GroupController()
{

	var self = this;
	this.initBindings = function() {
		var self = this;
		$('#addGroup').click(function(e){
			e.preventDefault();
			self.addGroup();
			return false;
		});


		$('#groupContent').on('click', '.deleteGroup', function(){		
			var groupId = $(this).data('id');
			log("delete group called");
			if (groupId) {
				self.removeGroup(groupId);
			}
		});	

		$('#groupContent').on('click', '.groupItem', function(){		
			var groupId = $(this).data('id');
			log("go to group called");
			if (groupId) {
				window.location = '/group/'+groupId;
			}
		});
		
		$('#groupContent').on('click', '.favLinkButton', function() {
			var groupId = $(this).data('id');
			var isDefault = $(this).data('isdefault');
			log("make grp fav/unfav called " + isDefault);
			if (groupId) {
				self.toggleFav(groupId, (isDefault == 1 ? 0 : 1));
			}					
		});
	};
	


	this.getGroups = function() {
		var self = this;
		$.ajax({
			url: '/get/groups',
			dataType : 'json',
			type : 'GET',
			data: { userId: $('#userId').val()},
			success: function(data){	
	 			groupsModel.render(data);
			},
			error: function( jqXHR ,  textStatus,  errorThrown){
				log(jqXHR.statusText +' :: ' + textStatus + ' :: ' + errorThrown);
			}
		});	
	};
	
	this.addGroup = function() {
		var self = this;
		$.ajax({
			url: '/add/group',
			dataType : 'json',
			type : 'POST',
			data: { userId: $('#userId').val(), groupName: $("#groupName").val()},
			success: function(data){	 			
	 			//self.onUpdateSuccess("Group Added");
	 			groupsModel.render(data);
			},
			error: function( jqXHR ,  textStatus,  errorThrown){
				log(jqXHR.statusText +' :: ' + textStatus + ' :: ' + errorThrown);
			}
		});	
	};
	
	this.removeGroup = function(id) {
		var self = this;
		$.ajax({
			url: '/remove/group',
			dataType : 'json',
			type : 'POST',
			data: { groupId: id},
			success: function(data){
	 			log('Group Removed ' + data);
	 			groupsModel.render(data);
			},
			error: function( jqXHR ,  textStatus,  errorThrown){
				log(jqXHR.statusText +' :: ' + textStatus + ' :: ' + errorThrown);
			}
		});	
	};	

	this.toggleFav = function(id, val) {
		var self = this;
		$.ajax({
			url: '/update-toggle/group',
			dataType : 'json',
			type : 'POST',
			data: { groupId: id, value: val},
			success: function(data){
	 			log('Group Fav toggled ' + data);
	 			groupsModel.render(data);
			},
			error: function( jqXHR ,  textStatus,  errorThrown){
				log(jqXHR.statusText +' :: ' + textStatus + ' :: ' + errorThrown);
			}
		});	
	};	
}

GroupController.prototype.onUpdateSuccess = function(msg)
{
	$('.modal-alert').modal({ show : false, keyboard : true, backdrop : true });
	$('.modal-alert .modal-header h3').text('Success!');
	$('.modal-alert .modal-body p').html(msg ? msg : 'Operation Successful');
	$('.modal-alert').modal('show');
	$('.modal-alert button').off('click');
}