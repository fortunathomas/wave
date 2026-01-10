import mongoose from 'mongoose';

const PasswordSchema = new mongoose.Schema({
    password: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    }
}, {
    collection: 'spoiler'  // <- specifica la collection
});

const Password = mongoose.models.Password || mongoose.model('Password', PasswordSchema);

export default Password;