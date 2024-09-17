set -e

mongo <<EOF
db.createUser({
    user: 'askold_astakhov',
    pwd: 'qTSGSqs8FvYzJLVd',
    roles: [
        {
            role: 'readWrite',
            db: 'webbercrm',
        },
    ],
});

db.createCollection('users', { capped: false });

db.users.insertOne({
    username: 'admin',
    password: '$2b$10$x6eE.nOHN0ULIjcDcZuD3OdQxnQSWAE.3rjsOoZ/IwbvZ7kbWF.Ie',
    role: 'ADMIN',
    is_active: true,
});


EOF
