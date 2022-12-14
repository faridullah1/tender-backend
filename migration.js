// Models 
const { User } = require('./models/userModel');
const { Project } = require('./models/projectsModel');
const { Tender } = require('./models/tenderModel');
const { Bidding } = require('./models/biddingModel');
const { UserCompany } = require('./models/userCompanyModel');

module.exports = function() {
	UserCompany.hasOne(User, { constraints: true, OnDelete: 'RESTRICT', foreignKey: 'companyId' });
	User.belongsTo(UserCompany, { foreignKey: 'companyId' })

	User.hasMany(Project, { constraints: true, OnDelete: 'RESTRICT', foreignKey: 'clientId' });
	Project.belongsTo(User, { foreignKey: 'clientId' });

	Project.hasMany(Tender, { constraints: true, OnDelete: 'RESTRICT', foreignKey: 'projectId' });
	Tender.belongsTo(Project, { foreignKey: 'projectId' });

	User.hasOne(Tender, { constraints: true, OnDelete: 'RESTRICT', foreignKey: 'awardedTo' });
	Tender.belongsTo(User, { foreignKey: 'awardedTo' });

	User.hasMany(Bidding, { constraints: true, OnDelete: 'RESTRICT', foreignKey: 'userId'});
	Bidding.belongsTo(User, { foreignKey: 'userId' });

	Tender.hasMany(Bidding, { constraints: true, OnDelete: 'RESTRICT', foreignKey: 'tenderId'});
	Bidding.belongsTo(Tender, { foreignKey: 'tenderId' })
}