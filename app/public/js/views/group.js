var gmc = new GroupModelController();

$(document).ready(function(){

	gmc.init();
	
})

function GroupModelController () {
	return {
		element: null,
		init: function() {
			var self = this;
			self.initBindings();
			self.element = '#groupContent';
			self.getPeople();
		},
		
		initBindings : function() {
			var self = this;
			$('#addPeople').click(function(e){
				e.preventDefault();
				self.addPeople();
				return false;
			});


			$('#groupContent').on('click', '.removePeople', function(){		
				var peopleId = $(this).data('id');
				log("delete people called " + peopleId);
				if (peopleId) {
					self.removePeople(peopleId);
				}
			});	
		},
	
		render: function(group) {
			var self = this;
			$(self.element).empty();			
			$("#groupHeader").html(group.name);
			if (group.people && group.people.length > 0) {				
				$.each(group.people, function(i, item) {
					var grDiv = document.createElement('div');
					$(grDiv).addClass('groupContainer')
							.addClass('well')
							.append('<span>' + item.name + '</span>')
							.appendTo($(self.element));
					var butn = 	document.createElement('button');
					$(butn).addClass('btn-danger')
							.addClass('btn')
							.addClass('pull-right')
							.addClass('removePeople')
							.attr('data-id', item.id)
							.appendTo($(grDiv));
					var icon = document.createElement('i');
					$(icon).addClass('icon-minus')
						.appendTo($(butn));
					var span = document.createElement('span');
					$(span).text('Remove')
						.appendTo($(butn));	
						
				});
			} else {
				$(self.element).append('<p class="subheading"> Add people to group </p>');
			} 

		},	

		getPeople : function() {
			var self = this;
			$.ajax({
				url: '/get/group',
				dataType : 'json',
				type : 'GET',
				data: { id: $('#groupId').val()},
				success: function(data){	
					gmc.render(data);
				},
				error: function( jqXHR ,  textStatus,  errorThrown){
					log(jqXHR.statusText +' :: ' + textStatus + ' :: ' + errorThrown);
				}
			});	
		},

		addPeople : function() {
			var self = this;
			$.ajax({
				url: '/add/people',
				dataType : 'json',
				type : 'POST',
				data: { id: $('#groupId').val(), name: $("#name").val()},
				success: function(data){			
					
					gmc.render(data);
				},
				error: function( jqXHR ,  textStatus,  errorThrown){
					log(jqXHR.statusText +' :: ' + textStatus + ' :: ' + errorThrown);
				}
			});	
		},

		removePeople : function(id) {
			var self = this;
			$.ajax({
				url: '/remove/people',
				dataType : 'json',
				type : 'POST',
				data: { id: $('#groupId').val(), peopleId: id},
				success: function(data){
					log('People Removed ' + data);
					gmc.render(data);
				},
				error: function( jqXHR ,  textStatus,  errorThrown){
					log(jqXHR.statusText +' :: ' + textStatus + ' :: ' + errorThrown);
				}
			});	
		}	

	}

};



