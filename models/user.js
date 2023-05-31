class User {
    constructor(id, uid, credit, membership){
        this.id = id;
        this.uid = uid;
        this.credit = credit;
        this.membership = membership;
    }
}

module.exports = {
    User,
};