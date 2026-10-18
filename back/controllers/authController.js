// // controllers/authController.js
// const { sql, pool, poolConnect } = require('../models/db');
// const jwt = require('jsonwebtoken');
// const JWT_SECRET = 'your_jwt_secret_key';

// const register = async (req, res) => {
//     try {
//         await poolConnect;
//         const { name, f_name, l_name, position, Department, Room, Username, Password, confirmPassword } = req.body;

//         if (!name || !f_name || !l_name || !position || !Department || !Room || !Username || !Password || !confirmPassword) {
//             res.status(400).send('กรุณากรอกข้อมูลให้ครบถ้วน');
//             return;
//         }

//         if (Password !== confirmPassword) {
//             res.status(400).send('รหัสผ่านไม่ตรงกัน');
//             return;
//         }

//         const request = pool.request();
//         request.input('Username', sql.NVarChar, Username);
//         const result = await request.query('SELECT * FROM users WHERE Username = @Username');

//         if (result.recordset.length > 0) {
//             res.status(409).send('ชื่อผู้ใช้นี้ถูกใช้งานแล้ว');
//             return;
//         }

//         const insertUserQuery = 'INSERT INTO users (name, f_name, l_name, position, Department, Room, Username, Password) VALUES (@name, @f_name, @l_name, @position, @Department, @Room, @Username, @Password)';
//         request.input('name', sql.NVarChar, name);
//         request.input('f_name', sql.NVarChar, f_name);
//         request.input('l_name', sql.NVarChar, l_name);
//         request.input('position', sql.NVarChar, position);
//         request.input('Department', sql.NVarChar, Department);
//         request.input('Room', sql.NVarChar, Room);
//         request.input('Password', sql.NVarChar, Password);
//         await request.query(insertUserQuery);

//         res.send('การลงทะเบียนสำเร็จ');
//     } catch (err) {
//         console.error(err);
//         res.status(500).send('Failed to register user');
//     }
// };

// const login = async (req, res) => {
//     try {
//         await poolConnect;
//         const { username, password } = req.body;

//         if (!username || !password) {
//             res.status(400).send('กรุณากรอกข้อมูลให้ครบถ้วน');
//             return;
//         }

//         const request = pool.request();
//         request.input('username', sql.NVarChar, username);
//         const result = await request.query('SELECT * FROM ms_users WHERE username = @username');
//         const user = result.recordset[0];

//         if (user && password === user.password) {
//             const token = jwt.sign({ userId: user.id, username: user.username }, JWT_SECRET, { expiresIn: '12h' });
//             res.json({ message: 'เข้าสู่ระบบสำเร็จ', token: token });
//         } else {
//             res.status(401).send('ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง');
//         }
//     } catch (err) {
//         console.error(err);
//         res.status(500).send('Failed to login');
//     }
// };

// module.exports = {
//     register,
//     login
// };

// back/controllers/authController.js
const { sql, pool, poolConnect } = require("../models/db");

const jwt = require("jsonwebtoken");

const register = async (req, res) => {
  try {
    await poolConnect;
    const {
      name,
      f_name,
      l_name,
      position,
      Department,
      Room,
      Username,
      Password,
      confirmPassword,
    } = req.body;

    if (
      !name ||
      !f_name ||
      !l_name ||
      !position ||
      !Department ||
      !Room ||
      !Username ||
      !Password ||
      !confirmPassword
    ) {
      res.status(400).send("กรุณากรอกข้อมูลให้ครบถ้วน");
      return;
    }

    if (Password !== confirmPassword) {
      res.status(400).send("รหัสผ่านไม่ตรงกัน");
      return;
    }

    const request = pool.request();
    request.input("Username", sql.NVarChar, Username);
    const result = await request.query(
      "SELECT * FROM users WHERE Username = @Username"
    );

    if (result.recordset.length > 0) {
      res.status(409).send("ชื่อผู้ใช้นี้ถูกใช้งานแล้ว");
      return;
    }

    const insertUserQuery =
      "INSERT INTO users (name, f_name, l_name, position, Department, Room, Username, Password) VALUES (@name, @f_name, @l_name, @position, @Department, @Room, @Username, @Password)";
    request.input("name", sql.NVarChar, name);
    request.input("f_name", sql.NVarChar, f_name);
    request.input("l_name", sql.NVarChar, l_name);
    request.input("position", sql.NVarChar, position);
    request.input("Department", sql.NVarChar, Department);
    request.input("Room", sql.NVarChar, Room);
    request.input("Password", sql.NVarChar, Password);
    await request.query(insertUserQuery);

    res.send("การลงทะเบียนสำเร็จ");
  } catch (err) {
    console.error(err);
    res.status(500).send("Failed to register user");
  }
};
// back/controllers/authController.js
const login = async (req, res) => {
  try {
    await poolConnect;
    const { username, password } = req.body;

    if (!username || !password) {
      res.status(400).send("กรุณากรอกข้อมูลให้ครบถ้วน");
      return;
    }

    const request = pool.request();
    request.input("username", sql.NVarChar, username);
    const result = await request.query(
      "SELECT * FROM ms_users WHERE username = @username"
    );
    const user = result.recordset[0];
    if (user && password === user.password) {
      const payload = { id: user.userID, name: user.fullname };

      const token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: "12h",
      });

      res.json({
        message: "เข้าสู่ระบบสำเร็จ",
        token: token,
        user: payload,
      });
    } else {
      res.status(401).send("ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง");
    }
  } catch (err) {
    console.error(err);
    res.status(500).send("Failed to login");
  }
};

exports.getme = (req, res, next) => {
  res.json(req.user);
};

module.exports = {
  register,
  login,
};
