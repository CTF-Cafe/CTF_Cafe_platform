/* 
FUNCTION : Handle route errors
AUTHOR : RAXO
TODO : FIND HOW TO MAKE WORK
*/

async function errorHandler(func, ...args) {
    try {
        return await func(...args);
    } catch(error) {
        console.log(error);
        if(error.message) {
            return { state: "error", message: error.message };
        }
    }
}

module.exports = errorHandler;