// Models 
const { User } = require('./models/userModel');
const { Project } = require('./models/projectsModel');
const { Tender } = require('./models/tenderModel');

module.exports = function() {
	User.hasMany(Project, { constraints: true, OnDelete: 'CASECADE', foreignKey: 'clientId' });
	Project.belongsTo(User, { foreignKey: 'clientId' });

	Project.hasOne(Tender, { constraints: true, OnDelete: 'CASECADE', foreignKey: 'projectId' });
	Tender.belongsTo(Project, { foreignKey: 'projectId' });
}