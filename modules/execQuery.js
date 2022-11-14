const { Pool } = require('pg');
const _pool = new Pool({
    host: process.env.HOST,
    user: process.env.USR,
    database: process.env.DB,
    password: process.env.PSWD,
    port: process.env.PORT,
    ssl: {rejectUnauthorized: false}
});

module.exports = {
    pool: _pool,

    //Executes a SQL Query
    execQuery: (cmd) => {
        return new Promise( (resolve, reject) => {
            output = []
            _pool.query(cmd)
            .then(query_res => {
                for (let i = 0; i < query_res.rowCount; i++){
                    if (typeof query_res.rows[i] != "undefined") {
                        output.push(query_res.rows[i])
                    }
                }
                //console.log(output)
                resolve(output)
            }).catch((error) => {
                console.log(error)
                reject(error);
            })
        })
    }
}

// //Executes a SQL Query
// function execQuery(cmd){
//     return new Promise( (resolve, reject) => {
//         output = []
//         pool.query(cmd)
//         .then(query_res => {
//             for (let i = 0; i < query_res.rowCount; i++){
//                 if (typeof query_res.rows[i] != "undefined") {
//                     output.push(query_res.rows[i])
//                 }
//             }
//             //console.log(output)
//             resolve(output)
//         }).catch((error) => {
//             console.log(error)
//             reject(error);
//         })
//     })
// }