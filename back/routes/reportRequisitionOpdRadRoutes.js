const {opdRequisitionRoutes,requisitionOpdFilters}=require('./opdRequisitionRoutes');
const reportRequisitionOpdRadRoutes=repository=>opdRequisitionRoutes(repository,'getRequisitionOpdRadReport');
module.exports={reportRequisitionOpdRadRoutes,requisitionOpdRadFilters:requisitionOpdFilters};
