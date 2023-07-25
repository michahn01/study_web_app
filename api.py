from flask import Flask, request, jsonify, make_response
from flask_sqlalchemy import SQLAlchemy
import uuid
from werkzeug.security import generate_password_hash, check_password_hash
import jwt
import datetime
from functools import wraps

app = Flask(__name__)

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
    public_id = db.Column(db.String(50), unique=True)
    name = db.Column(db.String(50))
    password = db.Column(db.String(80))
    admin = db.Column(db.Boolean)

    studysets = db.relationship('StudySet', backref='owner_user', lazy=True, cascade='all, delete-orphan')

class StudySet(db.Model):
    __tablename__ = "StudySet"
    id = db.Column(db.Integer, primary_key=True, nullable=False)
    name = db.Column(db.String(200))
    owner_user_id = db.Column(db.Integer, db.ForeignKey('User.id', ondelete='CASCADE'), nullable=False)
    termdefs = db.relationship('TermDefinition', backref='owner_set', lazy=True, cascade='all, delete-orphan')

class TermDefinition(db.Model):
    __tablename__ = "TermDefinition"
    id = db.Column(db.Integer, primary_key=True, nullable=False)
    owner_set_id = db.Column(db.Integer, db.ForeignKey('StudySet.id', ondelete='CASCADE'), nullable=False)
    term = db.Column(db.String(500))
    definition = db.Column(db.String(1000))
    

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



# -----------------------------------------------------------------------
# -----------------------------------------------------------------------
# ***** User Implementation *****
# -----------------------------------------------------------------------
# -----------------------------------------------------------------------
        

@app.route("/user", methods=["GET"])
@token_required
def get_all_users(current_user):

    # if not current_user.admin:
    #     return jsonify({"message": "Cannot perform that function. "})

    users = User.query.all()
    output = []

    for user in users:
        user_data = {}
        user_data["public_id"] = user.public_id
        user_data["name"] = user.name
        user_data["password"] = user.password
        user_data["admin"] = user.admin
        output.append(user_data)
    
    return jsonify({"users": output})

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
    user_data["name"] = user.name
    user_data["password"] = user.password
    user_data["admin"] = user.admin

    return jsonify({"user": user_data})

@app.route("/user", methods=["POST"])
# @token_required
def create_user():

    # if not current_user.admin:
    #     return jsonify({"message": "Cannot perform that function. "})

    data = request.get_json()
    hashed_password = generate_password_hash(data["password"], method="pbkdf2:sha256:150000", salt_length=8)
    new_user = User(public_id=str(uuid.uuid4()), name=data["name"], password=hashed_password, admin=False)
    db.session.add(new_user)
    db.session.commit()
    return jsonify({"message" : "New user created."})


@app.route("/user/<public_id>", methods=["PUT"])
# @token_required
def promote_user(public_id):

    # if not current_user.admin:
    #     return jsonify({"message": "Cannot perform that function. "})

    user = User.query.filter_by(public_id=public_id).first()

    if not user:
        return jsonify({"message": "No user found."})

    user.admin = True
    db.session.commit()

    return jsonify({"message": "The user has been promoted."})

@app.route("/user/<public_id>", methods=["DELETE"])
@token_required
def delete_user(current_user, public_id): 

    if not current_user.admin:
        return jsonify({"message": "Cannot perform that function. "})

    user = User.query.filter_by(public_id=public_id).first()

    if not user:
        return jsonify({"message": "No user found."})
    
    db.session.delete(user)
    db.session.commit()
    return jsonify({"message": "The user has been deleted."})

@app.route("/login")
def login():
    auth = request.authorization
    if not auth or not auth.username or not auth.password:
        return make_response("Could not verify", 401, {"WWW-Authenticate": "Basic realm='Login required.'"})
    
    user = User.query.filter_by(name=auth.username).first()

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

    return jsonify({"My StudySets": sets})

@app.route("/my-study-sets", methods=["POST"])
@token_required
def create_studyset(current_user):
    data = request.get_json()

    new_studyset = StudySet(name=data["studyset_name"], owner_user_id=current_user.id)

    db.session.add(new_studyset) 
    db.session.commit() 

    return jsonify({"message": "New StudySet created"})

@app.route("/my-study-sets", methods=["DELETE"])
@token_required
def delete_studyset(current_user):

    data = request.get_json()
    study_set_id = data["studyset_id"]

    studyset = None
    for set in current_user.studysets:
        if set.id == int(study_set_id):
            studyset = set
            break

    if not studyset:
        return jsonify({"message": "No StudySet found."})

    db.session.delete(studyset) 
    db.session.commit() 

    return jsonify({"message": "StudySet deleted"})

@app.route("/my-study-sets", methods=["PUT"])
@token_required
def modify_studyset(current_user):

    data = request.get_json()
    study_set_id = data["studyset_id"]

    studyset = None
    for set in current_user.studysets:
        if set.id == int(study_set_id):
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
    studyset = None
    for set in current_user.studysets:
        if set.id == int(study_set_id):
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

    return jsonify({"Terms in StudySet": termdefs})

@app.route("/my-study-sets/<study_set_id>", methods=["POST"])
@token_required
def create_termdef(current_user, study_set_id):

    studyset = None
    for set in current_user.studysets:
        if set.id == int(study_set_id):
            studyset = set
            break

    if not studyset:
        return jsonify({"message": "No StudySet found."})


    data = request.get_json()
    new_termdef = TermDefinition(term=data["term"], definition=data["definition"], owner_set=studyset)


    db.session.add(new_termdef) 
    db.session.commit() 

    return jsonify({"message": "New TermDef created"})

@app.route("/my-study-sets/<study_set_id>", methods=["DELETE"])
@token_required
def delete_termdef(current_user, study_set_id):

    studyset = None
    for set in current_user.studysets:
        if set.id == int(study_set_id):
            studyset = set
            break

    if not studyset:
        return jsonify({"message": "No StudySet found."})


    data = request.get_json()
    termdef_id = data["termdef_id"]

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

@app.route("/my-study-sets/<study_set_id>", methods=["PUT"])
@token_required
def modify_termdef(current_user, study_set_id):

    studyset = None
    for set in current_user.studysets:
        if set.id == int(study_set_id):
            studyset = set
            break

    if not studyset:
        return jsonify({"message": "No StudySet found."})


    data = request.get_json()
    termdef_id = data["termdef_id"]

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
    