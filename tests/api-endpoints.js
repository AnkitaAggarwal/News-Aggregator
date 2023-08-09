var supertest = require("supertest");
var should = require("should");

var server = supertest.agent("http://localhost:3000");

describe("register API tests",function(){

    it('should fail on missing username', function(done) {
        server
            .post('/register')
            .send({ password: 'password' })
            .expect(400)
            .end(function(err, res) {
                res.status.should.equal(400);
                res.body.message.should.equal('Invalid request - username or password is missing');
                done();
            });
    });

    it('should fail on missing password', function(done) {
        server
            .post('/register')
            .send({ username: 'username' })
            .expect(400)
            .end(function(err, res) {
                res.status.should.equal(400);
                res.body.message.should.equal('Invalid request - username or password is missing');
                done();
            });
    });

    it("should register new user successfully",function(done) {

        // If we use the same username - Tests will fail sayings user already exists
        let random_username = (Math.random() + 1).toString(36).substring(7);

        server
            .post("/register")
            .send({username: random_username, password: 'password'})
            .expect("Content-type",/json/)
            .expect(200)
            .end(function(err,res){
                res.status.should.equal(200);
                res.body.message.should.equal('User registered successfully');
                done();
            });
    });
});

describe("login API tests",function(){

    let random_username = (Math.random() + 1).toString(36).substring(7);

    // register username/password before running tests
    before(function(done) {
        server
            .post("/register")
            .send({username: random_username, password: 'password'})
            .expect("Content-type",/json/)
            .expect(200, done)
    });


    it('should fail on missing username', function(done) {
        server
            .post('/login')
            .send({ password: 'password' })
            .expect(400)
            .end(function(err, res) {
                res.status.should.equal(400);
                res.body.message.should.equal('Invalid request - username or password is missing');
                done();
            });
    });

    it('should fail if user not found', function(done) {
        server
            .post('/login')
            .send({ username: 'invalid', password: 'password' })
            .expect(401)
            .end(function(err, res) {
                res.status.should.equal(401);
                res.body.message.should.equal('User not found');
                done();
            });
    });

    it('should fail on invalid password', function(done) {
        server
            .post('/login')
            .send({ username: random_username, password: "invalid" })
            .expect(401)
            .end(function(err, res) {
                res.status.should.equal(401);
                res.body.message.should.equal('Invalid credentials');
                done();
            });
    });

    it("should login existing user",function(done) {

        server
            .post("/login")
            .send({username: random_username, password: 'password'})
            .expect("Content-type",/json/)
            .expect(200)
            .end(function(err,res){
                res.status.should.equal(200);
                res.body.token.should.not.equal(null);
                done();
            });
    });
});


describe("preferences & news API tests",function(){

    let token = null;

    let random_username = (Math.random() + 1).toString(36).substring(7);

    // register username/password before running tests
    before(function(done) {
        server
            .post("/register")
            .send({username: random_username, password: 'password'})
            .expect("Content-type",/json/)
            .expect(200)
            .then(function(res){
                // run login function and save token
                server
                    .post("/login")
                    .send({username: random_username, password: 'password'})
                    .expect("Content-type",/json/)
                    .expect(200)
                    .end(function(err,res){
                        token = res.body.token;
                        done();
                    })
            });
    });

    it('should return empty preferences', function(done) {
        server
            .get('/preferences')
            .set('authorization', token)
            .expect(200)
            .end(function(err, res) {
                res.status.should.equal(200);
                res.body.preferences.should.not.equal(null);
                res.body.preferences.should.not.equal(undefined);
                res.body.preferences.should.deepEqual({});
                done();
            });
    });

    it('should update preferences', function(done) {
        server
            .put('/preferences')
            .set('authorization', token)
            .send({preferences: {category: 'business'}})
            .expect(200)
            .end(function(err, res) {
                res.status.should.equal(200);
                res.body.message.should.equal('Preferences updated successfully');
                done();
            });
    });

    it('should return updated preferences', function(done) {
        server
            .get('/preferences')
            .set('authorization', token)
            .expect(200)
            .end(function(err, res) {
                res.status.should.equal(200);
                res.body.preferences.should.not.equal(null);
                res.body.preferences.should.not.equal(undefined);
                res.body.preferences.should.deepEqual({category: 'business'});
                done();
            });
    });

    it('should return news articles', function(done) {
        server
            .get('/news')
            .set('authorization', token)
            .expect(200)
            .end(function(err, res) {
                res.status.should.equal(200);
                res.body.articles.should.not.equal(null);
                res.body.articles.should.not.equal(undefined);
                res.body.articles.should.be.an.Array();
                done();
            });
    });
});






