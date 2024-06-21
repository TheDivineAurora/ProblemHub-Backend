exports.checkAuthenicated = (req, res, next) => {
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect('/login');
}

exports.checkNotAuthenicated = (req, res, next) => {
    if(req.isAuthenticated()){
        res.redirect('/dashboard');
    }
    next();
}