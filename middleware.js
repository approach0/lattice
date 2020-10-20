const loginRoute = '/login'


exports.no_verify = function(req, res, next) {
  return next()
}

exports.jwt_verify = function(req, res, next) {
}
