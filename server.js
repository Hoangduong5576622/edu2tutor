const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcrypt');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(cors());
app.use(express.json());

// Tạo thư mục uploads nếu chưa có
const uploadDir = './uploads';
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

// Cho phép xem ảnh từ trình duyệt
app.use('/uploads', express.static('uploads'));

// 1. Kết nối MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/edututor')
    .then(() => console.log('Đã kết nối Database! 🎉'))
    .catch(err => console.log('Lỗi kết nối:', err));

// 2. Schema User (Thêm trường avatar)
const userSchema = new mongoose.Schema({
    fullname: String,
    email: { type: String, unique: true },
    password: String,
    avatar: { type: String, default: '' }
});
const User = mongoose.model('User', userSchema);

// 3. Cấu hình Multer để lưu file ảnh
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage: storage });

// --- API ---

app.post('/api/register', async (req, res) => {
    const { fullname, email, password } = req.body;
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'Email đã tồn tại!' });
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ fullname, email, password: hashedPassword });
    await newUser.save();
    res.status(201).json({ message: 'Đăng ký thành công!' });
});

app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (user && await bcrypt.compare(password, user.password)) {
        res.json({ 
            message: 'Thành công', 
            fullname: user.fullname, 
            email: user.email, 
            avatar: user.avatar 
        });
    } else {
        res.status(400).json({ message: 'Sai email hoặc mật khẩu!' });
    }
});

// API UPLOAD AVATAR
app.post('/api/upload-avatar', upload.single('avatar'), async (req, res) => {
    try {
        const { email } = req.body;
        const avatarPath = `/uploads/${req.file.filename}`;
        await User.findOneAndUpdate({ email: email }, { avatar: avatarPath });
        res.json({ message: 'Up ảnh xong rồi sếp!', avatarUrl: `http://localhost:5000${avatarPath}` });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi upload' });
    }
});

app.listen(5000, () => console.log('Server chạy ở http://localhost:5000'));