module.exports = function(f) {
    return  (...args) => new Promise((ok, err) => 
        f(...args, (error, data) => error ? err(error) : ok(data))
    )
}