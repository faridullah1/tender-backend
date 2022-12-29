// Models 
const { User } = require('./models/userModel');
const { Project } = require('./models/projectsModel');
const { Tender } = require('./models/tenderModel');

module.exports = function() {
	User.hasMany(Project, { constraints: true, OnDelete: 'RESTRICT', foreignKey: 'clientId' });
	Project.belongsTo(User, { foreignKey: 'clientId' });

	Project.hasMany(Tender, { constraints: true, OnDelete: 'RESTRICT', foreignKey: 'projectId' });
	Tender.belongsTo(Project, { foreignKey: 'projectId' });
}