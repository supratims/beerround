var hc = new HomeController();	
var homemodel = new HomeModel();

$(document).ready(function(){
	homemodel.init();
	hc.initBindings();
})

function HomeModel () {
	return {
		element: null,
		init: function() {
			var self = this;
			self.element = '#homeContent';
			hc.getDefaultGroup();
		},

		render: function(group) {
			var self = this;
			$(self.element).empty();
			
			if (group && group._id) {
				var grpBar = document.createElement('div');
				$(grpBar).addClass('btn-group')
					.css('margin', '20px 0px')
					.appendTo($(self.element));
				var grpName = document.createElement('span');
				$(grpName).addClass('groupItem')
					.addClass('btn-info')	
					.addClass('btn')
					.addClass('btn-link')						
					.width('300')
					.text(group.name)
					.data('id', group._id)
					.appendTo($(grpBar));
				var favLink = document.createElement('a');					
				var favLinkClass = ('btn-warning');					
				$(favLink).addClass('btn')
					.addClass(favLinkClass)
					.attr('href', '#')
					.appendTo($(grpBar));
				var iconFav = document.createElement('i');
				$(iconFav).addClass('icon-heart')
					.addClass('icon-white')
					.appendTo($(favLink));
					
				if (group.people) {
					$.each(group.people, function(i, p) {
						var persBar = document.createElement('div');
						$(persBar).addClass('btn-group')	
							.addClass('ui-group')
							.css('margin', '20px 0px')
							.appendTo($(self.element));	
					
						var persName = document.createElement('span');
						$(persName).addClass('personItem')
							.addClass('btn-warning')	
							.addClass('btn')
							.addClass('btn-large')
							.addClass('btn-link')
							.addClass('largeButton')
							.width('200')
							.height('50')
							.text(p.name)
							.data('personid', p.id)
							.data('groupid', group._id)
							.appendTo($(persBar));
						var countDiv = document.createElement('span');
						$(countDiv).addClass('btn')			
							.addClass('btn-large')							
							.addClass('btn-success')
							.text(p.beer ? p.beer : 0)
							.width('30')
							.addClass('largeButton')
							.height('50')							
							.appendTo($(persBar));
						var addLink = document.createElement('a');				
						$(addLink).addClass('btn').addClass('btn-large')
							.addClass('addDrink')
							.data('personid', p.id)
							.data('groupid', group._id)							
							.addClass('largeButton')
							.height('50')
							.attr('href', '#')
							.appendTo($(persBar));
						var iconFav1 = document.createElement('i');
						$(iconFav1).addClass('icon-plus')					
							.appendTo($(addLink));	
							
						var minusLink = document.createElement('a');	
						$(minusLink).addClass('btn').addClass('btn-large')
							.addClass('removeDrink')
							.data('personid', p.id)
							.data('groupid', group._id)	
							.addClass('largeButton')
							.height('50')
							.attr('href', '#')
							.appendTo($(persBar));
						var iconFav2 = document.createElement('i');
						$(iconFav2).addClass('icon-minus')						
							.appendTo($(minusLink));	
							
							
					});
				}
			} else {
				var msgBar = document.createElement('div');		
				$(msgBar).append('<strong>No default group set</strong>').addClass('error');
				$(msgBar).appendTo($(self.element));				

			} 

		},	
	}

};
function HomeController()
{
	var self = this;
	this.initBindings = function() {
		var self = this;
		
		$('#homeContent').on('click', '.groupItem', function(){		
			var groupId = $(this).data('id');
			log("go to group called");
			if (groupId) {
				window.location = '/group/'+groupId;
			}
		});	
		
		$('#homeContent').on('click', '.addDrink', function(){
			var personid = $(this).data('personid');
			var groupid = $(this).data('groupid');
			self.addDrink(groupid, personid);
		});

		$('#homeContent').on('click', '.removeDrink', function(){
			var personid = $(this).data('personid');
			var groupid = $(this).data('groupid');
			self.removeDrink(groupid, personid);			
		});
	};

	this.getDefaultGroup = function() {
		var self = this;
		$.ajax({
			url: '/get/default-group',
			dataType : 'json',
			type : 'GET',
			data: { },
			success: function(data){	
	 			homemodel.render(data);
			},
			error: function( jqXHR ,  textStatus,  errorThrown){
				log(jqXHR.statusText +' :: ' + textStatus + ' :: ' + errorThrown);
			}
		});	
	};


	this.addDrink = function(grpid, pplid) {
		var self = this;
		$.ajax({
			url: '/add/drink',
			dataType : 'json',
			type : 'POST',
			data: { id: grpid, peopleId: pplid},
			success: function(data){		

				homemodel.render(data);
			},
			error: function( jqXHR ,  textStatus,  errorThrown){
				log(jqXHR.statusText +' :: ' + textStatus + ' :: ' + errorThrown);
			}
		});	
	};

	this.removeDrink = function(grpid, pplid) {
		var self = this;
		$.ajax({
			url: '/remove/drink',
			dataType : 'json',
			type : 'POST',
			data: { id: grpid, peopleId: pplid},
			success: function(data){		

				homemodel.render(data);
			},
			error: function( jqXHR ,  textStatus,  errorThrown){
				log(jqXHR.statusText +' :: ' + textStatus + ' :: ' + errorThrown);
			}
		});	
	};
}
