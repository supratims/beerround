var crypto 		= require('crypto');
var MongoDB 	= require('mongodb').Db;
var Server 		= require('mongodb').Server;
var moment 		= require('moment');
var ObjectID    = require('mongodb').ObjectID;

var dbPort 		= 27017;
var dbHost 		= 'localhost';
var dbName 		= 'mydrinks';

/* establish the database connection */

var db = new MongoDB(dbName, new Server(dbHost, dbPort, {auto_reconnect: true}), {w: 1});
	db.open(function(e, d){
	if (e) {
		log(e);
	}	else{
		log('connected to database :: ' + dbName);
	}
});
var accounts = db.collection('accounts');
var groups = db.collection('groups');

exports.addGroup = function(data, callback) {

	var thisgroup = data.groupName;
    accounts.findOne({_id: getObjectId(data.userId)}, function(e, user) {    
    	if (user) {
			var groupData = {};
			groupData.name=thisgroup;
			groupData.userId=user._id.toString();
			groupData.date=moment().format('MMMM Do YYYY, h:mm:ss a');
			groups.insert(groupData, {safe: true}, callback);    	
    	} else {
    		callback(e);
    	}
    });
}

exports.removeGroup = function(id, callback) {
	groups.remove({_id: getObjectId(trimQuotes(id))}, callback);
}

exports.getGroupList = function(id, callback) {
    log('Finding groups for user id ' + id);
    groups.find({'userId': id}, function(e, list) {
    	list.toArray(function(res, array) {
    		if (array) callback(array)
    		else callback(null, e);
    	});   	
    });
};

exports.getGroup = function(id, callback) {
    log('Finding group with id ' + id);
    groups.findOne({'_id':  getObjectId(trimQuotes(id))}, function(e, grp) {    	
		if (grp) callback(grp)
		else callback(null, e);    	   	
    });
};

exports.getDefaultGroup = function(userid, callback) {
    log('Finding default group for user id ' + userid);
    groups.findOne({'userId':  userid, 'default': '1'}, function(e, grp) {    	
		if (grp) callback(grp)
		else callback(null, e);    	   	
    });
}; 

exports.addPeople = function(id, peopleName, callback) {
    //log('Adding people to group with id ' + id);
    groups.findOne({'_id':  getObjectId(trimQuotes(id))}, function(e, grp) {    	
		if (grp) {
			groups.update( 
				{'_id':  getObjectId(trimQuotes(id))},
				{
				     $push: { people: { id: ObjectID(), name: peopleName } }
   				},
   				function(err, count) {
   					callback(grp, err);
   				}
			);
		}
		else callback(null, e);    	   	
    });
};

exports.removePeople = function(id, peopleId, callback) {
    //log('Removing people from group with id ' + id);
    groups.findOne({'_id':  getObjectId(trimQuotes(id))}, function(e, grp) {    	
		if (grp) {
			groups.update( 
				{'_id':  getObjectId(trimQuotes(id))},
				{
				     $pop: { people: { id: peopleId } }
   				},
   				function(err, count) {
   					callback(grp, err);
   				}
			);
		}
		else callback(null, e);       	
    });
};

exports.addDrink = function(id, peopleId, callback) {
    groups.findOne({'_id':  getObjectId(trimQuotes(id))}, function(e, grp) {    	
		if (grp) {
			groups.update( 
				{'_id':  getObjectId(trimQuotes(id)), 'people.id':  getObjectId(trimQuotes(peopleId))},
				{
				     $inc : {"people.$.beer" : 1} 
   				},{multi: false, upsert: true},
   				function(err, count) {
   					callback(grp, err);
   				}
			);
		}
		else callback(null, e);    	   	
    });
};
exports.removeDrink = function(id, peopleId, callback) {
    groups.findOne({'_id':  getObjectId(trimQuotes(id))}, function(e, grp) {    	
		if (grp) {
			groups.update( 
				{'_id':  getObjectId(trimQuotes(id)), 'people.id':  getObjectId(trimQuotes(peopleId))},
				{
				     $inc : {"people.$.beer" : -1} 
   				},{multi: false, upsert: true},
   				function(err, count) {
   					callback(grp, err);
   				}
			);
		}
		else callback(null, e);    	   	
    });
};


exports.updateToggleGroup = function(id, val, callback) {	
    if (val == '0') {
			groups.update( 
				{'_id':  getObjectId(trimQuotes(id))},
				{
				     $set: { default: val }
   				}, callback
			);    		    
    } else {
		//first reset all fav
		groups.update( { default : '1' }, { $set: { default: '0' } }, {multi: true}, function(err, count) {
			if (!err) {
				groups.update( 
					{'_id':  getObjectId(trimQuotes(id))},
					{
						 $set: { default: val }
					}, callback
				);    		
			}
		});    
    }

}; 

var getObjectId = function(id)
{
	return groups.db.bson_serializer.ObjectID.createFromHexString(id);
}

var trimQuotes = function(id) {
    id && (id != undefined) && (id.length > 24) && (id = id.substring(1,25));
    return id;
}

var log = function(str) {
	var DEBUG = true;
	DEBUG && console && console.log('[DB] ' + str);
}



