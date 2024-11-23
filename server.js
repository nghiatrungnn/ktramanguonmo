// server.js
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const db = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

// Phục vụ tệp HTML
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Lấy danh sách đặt chỗ
app.get('/api/bookings', (req, res) => {
    db.all('SELECT * FROM Bookings', [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

// Thêm đặt chỗ mới
app.post('/api/bookings', (req, res) => {
    const { customerName, date, time } = req.body;
    db.run('INSERT INTO Bookings (customerName, date, time) VALUES (?, ?, ?)', [customerName, date, time], function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ id: this.lastID, customerName, date, time, status: 'Pending' });
    });
});

// Cập nhật thông tin đặt chỗ
app.put('/api/bookings/:id', (req, res) => {
    const id = req.params.id;
    const { customerName, date, time } = req.body;

    db.run('UPDATE Bookings SET customerName = ?, date = ?, time = ? WHERE id = ?', [customerName, date, time, id], function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ message: 'Đặt chỗ đã được cập nhật!' });
    });
});

// Hủy đặt chỗ
app.put('/api/bookings/cancel/:id', (req, res) => {
    const id = req.params.id;

    db.run('UPDATE Bookings SET status = ? WHERE id = ?', ['Cancelled', id], function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ message: 'Đặt chỗ đã được hủy!' });
    });
});

// Xóa đặt chỗ
app.delete('/api/bookings/:id', (req, res) => {
    const id = req.params.id;

    db.run('DELETE FROM Bookings WHERE id = ?', id, function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ message: 'Đặt chỗ đã được xóa!' });
    });
});

// Xóa tất cả đặt chỗ và reset ID
app.delete('/api/bookings', (req, res) => {
    db.serialize(() => {
        db.run('DELETE FROM Bookings', function(err) {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            db.run('DELETE FROM sqlite_sequence WHERE name = "Bookings"', function(err) {
                if (err) {
                    res.status(500).json({ error: err.message });
                    return;
                }
                res.json({ message: 'Tất cả đặt chỗ đã được xóa!' });
            });
        });
    });
});

// Khởi động server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
