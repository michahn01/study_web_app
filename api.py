from flask import Flask, request, jsonify, make_response
from flask_sqlalchemy import SQLAlchemy
import uuid
from werkzeug.security import generate_password_hash, check_password_hash
import jwt
import datetime
from functools import wraps
from flask_cors import CORS

app = Flask(__name__)
CORS(app, origins=["http://localhost:3000"])

app.config["SECRET_KEY"] = "thisissecret"
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///study.db"

db = SQLAlchemy(app)


# -----------------------------------------------------------------------
# -----------------------------------------------------------------------
# ***** Database Tables *****
# -----------------------------------------------------------------------
# -----------------------------------------------------------------------


class User(db.Model):
    __tablename__ = "User"
    id = db.Column(db.Integer, primary_key=True, nullable=False)
    public_id = db.Column(db.String, unique=True)
    username = db.Column(db.String, unique=True)
    password = db.Column(db.String)
    admin = db.Column(db.Boolean)

    studysets = db.relationship('StudySet', backref='owner_user', lazy=True, cascade='all, delete-orphan')

class StudySet(db.Model):
    __tablename__ = "StudySet"
    id = db.Column(db.Integer, primary_key=True, nullable=False)
    name = db.Column(db.String)
    owner_user_id = db.Column(db.Integer, db.ForeignKey('User.id', ondelete='CASCADE'), nullable=False)
    termdefs = db.relationship('TermDefinition', backref='owner_set', lazy=True, cascade='all, delete-orphan')

class TermDefinition(db.Model):
    __tablename__ = "TermDefinition"
    id = db.Column(db.Integer, primary_key=True, nullable=False)
    owner_set_id = db.Column(db.Integer, db.ForeignKey('StudySet.id', ondelete='CASCADE'), nullable=False)
    term = db.Column(db.String)
    definition = db.Column(db.String)
    

# -----------------------------------------------------------------------
# -----------------------------------------------------------------------
# ***** JSON Token Implementation for User Authentication *****
# -----------------------------------------------------------------------
# -----------------------------------------------------------------------

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        if 'x-access-token' in request.headers:
            token = request.headers["x-access-token"]
        
        if not token:
            return jsonify({"message": "Token is missing."}), 401

        try:
            data = jwt.decode(token, app.config["SECRET_KEY"], algorithms=["HS256"])
            current_user = User.query.filter_by(public_id=data["public_id"]).first()
        except jwt.ExpiredSignatureError:
            return jsonify({"message": "Token has expired."}), 401
        except:
            return jsonify({"message": "Token is invalid."}), 401

        return f(current_user, *args, **kwargs)

    return decorated

@app.route("/login/verify", methods=["GET"])
@token_required
def check_login(current_user):
    return jsonify({"message": "Token is valid."})


# -----------------------------------------------------------------------
# -----------------------------------------------------------------------
# ***** User Implementation *****
# -----------------------------------------------------------------------
# -----------------------------------------------------------------------
        

# REQUIRES: 
#    * Must be logged in as a user with admin=True
# MODIFIES:
#    * N/A
# EFFECTS:
#    * Returns a list of all users in the database
@app.route("/user", methods=["GET"])
@token_required
def get_all_users(current_user):

    if not current_user.admin:
        return jsonify({"message": "Cannot perform that function. "})

    users = User.query.all()
    output = []

    for user in users:
        user_data = {}
        user_data["public_id"] = user.public_id
        user_data["username"] = user.username
        user_data["admin"] = user.admin
        output.append(user_data)
    
    return jsonify({"users": output})


# REQUIRES: 
#    * Must be logged in as a user with admin=True
# MODIFIES:
#    * N/A
# EFFECTS:
#    * Returns information about the specified user from the database
@app.route("/user/<public_id>", methods=["GET"])
@token_required
def get_one_user(current_user, public_id):

    if not current_user.admin:
        return jsonify({"message": "Cannot perform that function. "})

    user = User.query.filter_by(public_id=public_id).first()

    if not user:
        return jsonify({"message": "No user found."})

    user_data = {}
    user_data["public_id"] = user.public_id
    user_data["username"] = user.username
    user_data["admin"] = user.admin

    return jsonify({"user": user_data})



# REQUIRES: 
#    * Body of HTTP request must be in JSON format containing the following keys:
#    * "username"
#    * "password"
# MODIFIES:
#    * User table in database
# EFFECTS:
#    * Registers a new user account. 
#    * Creates a new instance of User and adds it as a row to the User table in the database.
@app.route("/register", methods=["POST"])
def create_user():
    
    data = request.get_json()
    if not ("username" in data and "password" in data):
        return jsonify({"message": "Insufficient data. Have 'username' and 'password' in request body."})

    user = User.query.filter_by(username=data["username"]).first()
    if not user == None: 
        return jsonify({"message": "username already taken"})

    hashed_password = generate_password_hash(data["password"], method="pbkdf2:sha256:150000", salt_length=8)
    new_user = User(public_id=str(uuid.uuid4()), username=data["username"], password=hashed_password, admin=False)
    db.session.add(new_user)
    db.session.commit()
    return jsonify({"message" : "New user created."})

@app.route("/register/<username>", methods=["GET"])
def check_username_availability(username):
    user = User.query.filter_by(username=username).first()
    if not user == None: 
        return jsonify({"message": "username already taken"})

    return jsonify({"message" : "username available."})


# REQUIRES: 
#    * Must be logged in as a user with admin=True
# MODIFIES:
#    * .admin member of User with specified public_id
# EFFECTS:
#    * Promotes the specified user to admin status. 
@app.route("/user/<public_id>", methods=["PUT"])
@token_required
def promote_user(public_id):

    if not current_user.admin:
        return jsonify({"message": "Cannot perform that function. "})

    user = User.query.filter_by(public_id=public_id).first()

    if not user:
        return jsonify({"message": "No user found."})

    user.admin = True
    db.session.commit()

    return jsonify({"message": "The user has been promoted."})

# REQUIRES: 
#    * Must be logged in as a user with admin=True or as the user to be deleted
# MODIFIES:
#    * User table in database.
# EFFECTS:
#    * Deletes the user with the specified public_id.
@app.route("/user/<public_id>", methods=["DELETE"])
@token_required
def delete_user(current_user, public_id): 

    if not current_user.admin or not current_user.public_id == public_id:
        return jsonify({"message": "Cannot perform that function. "})

    user = User.query.filter_by(public_id=public_id).first()

    if not user:
        return jsonify({"message": "No user found."})
    
    db.session.delete(user)
    db.session.commit()
    return jsonify({"message": "The user has been deleted."})

# REQUIRES: 
#    * HTTP request must use Basic Authorization to fill in username and password info.
# MODIFIES:
#    * N/A
# EFFECTS:
#    * Logins in user by returning a JSON web token 
#    * Any route decorated with @token_requires needs 
#      the provided JSON token in a header as the value
#      of a key named "x-access-token"
@app.route("/login")
def login():
    auth = request.authorization
    if not auth or not auth.username or not auth.password:
        return make_response("Could not verify", 401, {"WWW-Authenticate": "Basic realm='Login required.'"})
    
    user = User.query.filter_by(username=auth.username).first()

    if not user:
        return make_response("Could not verify", 401, {"WWW-Authenticate": "Basic realm='Login required.'"})
    
    if check_password_hash(user.password, auth.password):
        token = jwt.encode({"public_id" : user.public_id, "exp" : datetime.datetime.utcnow() + datetime.timedelta(minutes=120)}, app.config["SECRET_KEY"])
        return jsonify({"token": token})
    
    return make_response("Could not verify", 401, {"WWW-Authenticate": "Basic realm='Login required.'"})



# -----------------------------------------------------------------------
# -----------------------------------------------------------------------
# ***** StudySet Implementation *****
# -----------------------------------------------------------------------
# -----------------------------------------------------------------------

@app.route("/my-study-sets", methods=["GET"])
@token_required
def get_all_studysets(current_user):
    sets = []
    for set in current_user.studysets:
        set_data = {}
        set_data["id"] = set.id
        set_data["name"] = set.name
        set_data["owner_user_id"] = set.owner_user_id
        sets.append(set_data)

    return jsonify({"StudySets": sets})

@app.route("/my-study-sets", methods=["POST"])
@token_required
def create_studyset(current_user):
    data = request.get_json()

    new_studyset = StudySet(name=data["studyset_name"], owner_user_id=current_user.id)

    db.session.add(new_studyset) 
    db.session.commit() 

    return jsonify({"message": "New StudySet created", "studyset_id": f"{new_studyset.id}"})

@app.route("/my-study-sets/<studyset_id>", methods=["DELETE"])
@token_required
def delete_studyset(current_user, studyset_id):

    try:
        study_set_id = int(studyset_id)
    except:
        return jsonify({"message": "StudySet ID could not be converted to integer.",
                        "ID": study_set_id})

    studyset = None
    for set in current_user.studysets:
        if set.id == study_set_id:
            studyset = set
            break

    if not studyset:
        return jsonify({"message": "No StudySet found."})

    db.session.delete(studyset) 
    db.session.commit() 

    return jsonify({"message": "StudySet deleted"})

@app.route("/my-study-sets/<studyset_id>", methods=["PUT"])
@token_required
def modify_studyset(current_user, studyset_id):

    data = request.get_json()

    try:
        study_set_id = int(study_set_id)
    except:
        return jsonify({"message": "No StudySet found."})

    studyset = None
    for set in current_user.studysets:
        if set.id == study_set_id:
            studyset = set
            break

    if not studyset:
        return jsonify({"message": "No StudySet found."})

    studyset.name = data["new_name"]

    db.session.commit() 

    return jsonify({"message": "StudySet modified"})



# -----------------------------------------------------------------------
# -----------------------------------------------------------------------
# ***** TermDefinition Implementation *****
# -----------------------------------------------------------------------
# -----------------------------------------------------------------------

@app.route("/my-study-sets/<study_set_id>", methods=["GET"])
@token_required
def get_all_termdefs(current_user, study_set_id):

    try:
        study_set_id = int(study_set_id)
    except:
        return jsonify({"message": "No StudySet found."})

    studyset = None
    for set in current_user.studysets:
        if set.id == study_set_id:
            studyset = set
            break

    if not studyset:
        return jsonify({"message": "No StudySet found."})

    termdefs = []
    for termdef in studyset.termdefs:
        data = {}
        data["id"] = termdef.id
        data["term"] = termdef.term
        data["definition"] = termdef.definition
        termdefs.append(data)

    return jsonify({"message": "StudySet found.", 
                    "Terms in StudySet": termdefs, 
                    "StudySet Name": studyset.name})

@app.route("/my-study-sets/<study_set_id>", methods=["POST"])
@token_required
def create_termdef(current_user, study_set_id):

    try:
        study_set_id = int(study_set_id)
    except:
        return jsonify({"message": "No StudySet found."})

    studyset = None
    for set in current_user.studysets:
        if set.id == study_set_id:
            studyset = set
            break

    if not studyset:
        return jsonify({"message": "No StudySet found."})


    data = request.get_json()
    new_termdefs = data["new_termdefs"]
    
    for termdef in new_termdefs:
        db.session.add(TermDefinition(term=termdef["term"], definition=termdef["definition"], owner_set=studyset))


    db.session.commit() 

    return jsonify({"message": "New TermDef(s) created"})

@app.route("/my-study-sets/<study_set_id>/all-contents", methods=["DELETE"])
@token_required
def bulk_delete_termdefs(current_user, study_set_id):

    try:
        study_set_id = int(study_set_id)
    except:
        return jsonify({"message": "No StudySet found."})

    studyset = None
    for set in current_user.studysets:
        if set.id == study_set_id:
            studyset = set
            break

    if not studyset:
        return jsonify({"message": "No StudySet found."})
    
    for termdef in studyset.termdefs:
        db.session.delete(termdef)


    db.session.commit() 

    return jsonify({"message": "All termdefs deleted"})


@app.route("/my-study-sets/<study_set_id>/all-contents", methods=["PUT"])
@token_required
def bulk_edit(current_user, study_set_id):

    try:
        study_set_id = int(study_set_id)
    except:
        return jsonify({"message": "No StudySet found."})

    studyset = None
    for set in current_user.studysets:
        if set.id == study_set_id:
            studyset = set
            break

    if not studyset:
        return jsonify({"message": "No StudySet found."})
    
    for termdef in studyset.termdefs:
        db.session.delete(termdef)

    data = request.get_json()
    new_termdefs = data["new_termdefs"]
    
    for termdef in new_termdefs:
        db.session.add(TermDefinition(term=termdef["term"], definition=termdef["definition"], owner_set=studyset))

    studyset.name = data["new_name"]

    db.session.commit() 

    return jsonify({"message": "StudySet recreated in bulk"})




@app.route("/my-study-sets/<study_set_id>/<termdef_id>", methods=["DELETE"])
@token_required
def delete_termdef(current_user, study_set_id, termdef_id):

    try:
        study_set_id = int(study_set_id)
    except:
        return jsonify({"message": "No StudySet found."})

    studyset = None
    for set in current_user.studysets:
        if set.id == study_set_id:
            studyset = set
            break

    if not studyset:
        return jsonify({"message": "No StudySet found."})


    data = request.get_json()

    termdef = None
    for td in studyset.termdefs:
        if td.id == int(termdef_id):
            termdef = td
            break

    if not termdef:
        return jsonify({"message": "No TermDef found."})


    db.session.delete(termdef) 
    db.session.commit() 

    return jsonify({"message": "TermDef deleted"})

@app.route("/my-study-sets/<study_set_id>/<termdef_id>", methods=["PUT"])
@token_required
def modify_termdef(current_user, study_set_id, termdef_id):

    try:
        study_set_id = int(study_set_id)
    except:
        return jsonify({"message": "No StudySet found."})

    studyset = None
    for set in current_user.studysets:
        if set.id == study_set_id:
            studyset = set
            break

    if not studyset:
        return jsonify({"message": "No StudySet found."})


    data = request.get_json()

    termdef = None
    for td in studyset.termdefs:
        if td.id == int(termdef_id):
            termdef = td
            break

    if not termdef:
        return jsonify({"message": "No TermDef found."})


    termdef.term = data["new_term"]
    termdef.definition = data["new_definition"]

    db.session.commit() 

    return jsonify({"message": "TermDef modified"})




if __name__ == "__main__":
    app.run(debug=True)
    