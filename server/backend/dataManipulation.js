async function create(mongooseModel, value) {
    const newObject = mongooseModel(value);
    await newObject.save();
}

async function retrieve(mongooseModel, queryParams) {
    var results = await mongooseModel.find(queryParams);
    return results;
}

async function retrieveOne(mongooseModel, queryParams) {
    var results = await mongooseModel.findOne(queryParams);
    return results;
}

async function deleteMany(mongooseModel, queryParams) {
    var _ = await mongooseModel.deleteMany(queryParams);
};

let dataManipulatorFunctions = {create,retrieve,retrieveOne,deleteMany};
export default dataManipulatorFunctions;

