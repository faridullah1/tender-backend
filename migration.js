// Models 
const { User } = require('./models/userModel');
const { Project } = require('./models/projectsModel');

module.exports = function() {
	User.hasMany(Project, { constraints: true, OnDelete: 'CASECADE', foreignKey: 'clientId' });
	Project.belongsTo(User, { foreignKey: 'clientId' });
}