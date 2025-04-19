const express = require('express');
const router = express.Router();
const mysql = require('mysql2/promise');
const mysql2 = require('mysql2')
const session = require('express-session');
const multer = require('multer');
const path = require('path');
const puppeteer = require('puppeteer');
const htmlpdf = require('html-pdf-node');
const ejs = require('ejs')
const dbcon = {
  host: 'localhost',
  port: '3380',
  user: 'root',
  password: '',
  database: 'project64'
};
const pool = mysql.createPool(dbcon);
const conn = mysql2.createConnection(dbcon);
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/uploads');
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});
const upload = multer({ storage: storage });





router.use(session({
  secret: 'my-secret-key',
  resave: false,
  saveUninitialized: false
}));


conn.connect((err) => {
  if (err) {
    console.error('เกิดข้อผิดพลาดในการเชื่อมต่อกับ MySQL:', err);
    return;
  }
  console.log('เชื่อมต่อกับ MySQL สำเร็จ');
});





router.get('/', (req, res) => {
  const sql = "SELECT * FROM fruit ORDER BY f_id";
  conn.query(sql, (err, result) => {
    if (err) {
      console.error("Error querying database:", err);
      return res.status(500).send("An error occurred while fetching data.");
    }
    res.render('index', { user: req.session.user, fruits: result });
  })
})

router.get('/login', (req, res) => {
  res.render('login', { e: 'e' })
})

router.post('/login', (req, res) => {
  const { username, password } = req.body;
  const sql = 'SELECT * FROM customer WHERE (cus_user = ? OR cus_email = ?) AND cus_pass = ?';
  conn.query(sql, [username, username, password], (err, results) => {
    if (err) {
      console.error('เกิดข้อผิดพลาดในการค้นหาผู้ใช้:', err);
      return res.status(500).send('เกิดข้อผิดพลาดในระบบ');
    }
    if (results.length > 0) {
      req.session.user = results[0];
      console.log(req.session.user);
      res.redirect('/');
    } else {
      res.render('login', { e: 'err' });
    }
  });
});

router.get('/loginadmin', (req, res) => {
  res.render('loginadmin', { e: 'e' })
})

router.post('/loginadmin', (req, res) => {
  const { username, password } = req.body;
  const sql = 'SELECT * FROM user WHERE (username = ? OR email = ?) AND password = ?';
  conn.query(sql, [username, username, password], (err, results) => {
    if (err) {
      console.error('เกิดข้อผิดพลาดในการค้นหาผู้ใช้:', err);
      return res.status(500).send('เกิดข้อผิดพลาดในระบบ');
    }
    if (results.length > 0) {
      req.session.user = results[0];
      console.log(req.session.user);
      res.redirect('/');
    } else {
      res.render('loginadmin', { e: 'err' });
    }
  });
});


router.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('เกิดข้อผิดพลาดในการลบ session:', err);
      return res.status(500).send('เกิดข้อผิดพลาดในระบบ');
    }
    res.redirect('/');
  });
});

router.get('/signup', (req, res) => {
  res.render('signup', { e: 'e' });
});
router.post('/signup', (req, res) => {
  const customerData = req.body;

  // ตรวจสอบว่า username หรือ email ไม่มีการใช้งานซ้ำ
  const query = 'SELECT * FROM customer WHERE cus_user = ? OR cus_email = ?';
  conn.query(query, [customerData.Cus_user, customerData.Cus_email], (err, results) => {
    if (err) {
      console.error('Error querying the database:', err);
      return res.status(500).send('Error querying the database');
    }

    if (results.length > 0) {
      // มี username หรือ email ที่ใช้งานแล้ว
      return res.render('signup', { e: 'err' })
    }

    conn.query('SELECT cus_id FROM customer ORDER BY cus_id DESC', (selectErr, selectResults) => {
      if (selectErr) {
        console.error('Error querying the database:', selectErr);
        return res.status(500).send('Error querying the database');
      }
      let lastCusId = 0;
      if (selectResults.length > 0) {
        lastCusId = parseInt(selectResults[0].cus_id.substr(3)); // เอาตัวเลขออกมาแล้วแปลงเป็นตัวเลข
      }
      const nextCusId = 'CUS' + ('000' + (lastCusId + 1)).slice(-3);
      const { Cus_user, Cus_pass, Cus_name, Cus_email, Cus_Tel, Cus_address } = req.body;
      const sql = 'INSERT INTO customer  VALUES (?, ?, ?, ?, ?, ?, ?)';
      conn.query(sql, [nextCusId, Cus_user, Cus_pass, Cus_name, Cus_email, Cus_Tel, Cus_address], (err, results) => {
        if (err) {
          console.error('Error inserting data into the database:', err);
          return res.status(500).send('Error inserting data into the database');
        }
        return res.render('login', { e: 'ss' })
      });
    });
  });
});
router.get('/profile', (req, res) => {
  if (!req.session.user) {
    return res.redirect('/login');
  }
  res.render('customer/profile', { user: req.session.user, e: 'err' });
});
router.get('/shop', (req, res) => {
  if (!req.session.user) {
    return res.redirect('/loginadmin');
  }
  res.render('emp/edit_shop', { user: req.session.user, e: 'err' });
});
router.post('/editprofile', (req, res) => {
  const { name, tel, cus_address } = req.body;
  const id = req.session.user.cus_id; // Use req.session.user to get the user's ID
  const updateQuery = 'UPDATE customer SET name = ?, cus_tel= ?, cus_address = ? WHERE cus_id = ?';

  conn.query(updateQuery, [name, tel, cus_address, id], (err, results) => {
    if (err) {
      console.error('เกิดข้อผิดพลาดในการอัปเดตข้อมูล: ' + err.stack);
      return res.status(500).send('Internal Server Error');
    }

    console.log('อัปเดตข้อมูลเรียบร้อย');

    const selectQuery = 'SELECT * FROM customer WHERE cus_id=?';

    conn.query(selectQuery, [id], (err, rows) => {
      if (err) {
        console.error('เกิดข้อผิดพลาดในการดึงข้อมูลใหม่: ' + err.stack);
        return res.status(500).send('Internal Server Error');
      }

      if (rows.length > 0) {
        req.session.user = rows[0];

        return res.render('customer/profile', {
          user: req.session.user,
          e: 'ss'
        });
      } else {
        // Handle the case where the user with the given ID is not found
        return res.status(404).send('User not found');
      }
    });
  });
});
router.get('/addNewProduct', (req, res) => {
  if (!req.session.user) {
    return res.redirect('/loginadmin');
  }
  const query = 'SELECT * FROM fruit ORDER BY f_id DESC LIMIT 1';
  conn.query(query, (err, results) => {
    if (err) {
      console.error('Error querying the database:', err);
      return res.status(500).send('Error querying the database');
    }
    let lastfId = 0;
    if (results.length > 0) {
      lastfId = parseInt(results[0].f_id.substr(2));
    }
    const newfId = 'F' + ('000' + (lastfId + 1)).slice(-3);
    res.render('emp/addProduct', { user: req.session.user, e: 'null', fId: newfId });
  })

});
router.post('/addnewproduct', upload.single('f_img'), async (req, res) => {
  if (!req.session.user) {
    res.redirect('/loginadmin');
  } else {
    const { f_id, f_name, buy_price, f_price } = req.body;
    const imgPath = path.basename(req.file.path);
    const qr = 'INSERT INTO fruit  VALUES (?, ?, ?, ?, ?, ?)';
    conn.query(qr, [f_id, f_name, imgPath, buy_price, f_price, 0], (err, result) => {
      if (err) {
        console.error('Error querying the database:', err);
        return res.status(500).send('Error querying the database');
      }

      const query = 'SELECT * FROM fruit ORDER BY f_id DESC LIMIT 1';
      conn.query(query, (err, results) => {
        if (err) {
          console.error('Error querying the database:', err);
          return res.status(500).send('Error querying the database');
        }
        let lastfId = 0;
        if (results.length > 0) {
          lastfId = parseInt(results[0].f_id.substr(3));
        }
        const newfId = 'F' + ('000' + (lastfId + 1)).slice(-3);
        res.render('emp/addProduct', { user: req.session.user, e: 'ss', fId: newfId });
      })

    });
  }
});



router.get('/productlist', (req, res) => {
  if (!req.session.user) {
    return res.redirect('/loginadmin');
  }
  const sql = "SELECT * FROM fruit";
  conn.query(sql, (err, result) => {
    if (err) {
      console.error("Error querying database:", err);
      return res.status(500).send("An error occurred while fetching data.");
    }
    res.render('emp/productlist', { user: req.session.user, fruits: result, e: 'null' });
  })
})
router.get('/editpd/:f_id', (req, res) => {
  if (!req.session.user) {
    return res.redirect('/loginadmin');
  }
  const { f_id } = req.params;

  const sql = 'SELECT * FROM fruit WHERE f_id = ?';
  conn.query(sql, [f_id], (err, result) => {
    if (err) {
      console.error('Error querying the database:', err);
      return res.status(500).send('Error querying the database');
    }
    console.log(result);
    res.render('emp/editpd', { fruits: result[0], user: req.session.user, e: 'n' });
  });
});


router.post('/editpd', upload.single('f_img'), (req, res) => {
  if (!req.session.user) {
    return res.redirect('/loginadmin');
  }

  const { f_id, sale_price, buy_price } = req.body;

  // Check if an image file is uploaded
  if (req.file) {
    // If an image is uploaded, update both image and price
    const imgPath = path.basename(req.file.path);
    const updateQuery = 'UPDATE fruit SET f_img = ?, buy_price= ?, sale_price = ? WHERE f_id = ?';
    conn.query(updateQuery, [imgPath, buy_price, sale_price, f_id], (err, results) => {
      if (err) {
        console.error('เกิดข้อผิดพลาดในการอัปเดตข้อมูล: ' + err.stack);
        return res.status(500).send('Internal Server Error');
      }

      console.log('อัปเดตข้อมูลเรียบร้อย');
      const selectQuery = 'SELECT * FROM fruit WHERE f_id = ?';
      conn.query(selectQuery, [f_id], (err, rows) => {
        if (err) {
          console.error('เกิดข้อผิดพลาดในการดึงข้อมูลใหม่: ' + err.stack);
          return res.status(500).send('Internal Server Error');
        }

        if (rows.length > 0) {
          console.log(rows);
          return res.render('emp/editpd', { user: req.session.user, e: 'ss', fruits: rows[0] });
        } else {
          return res.status(404).send('Data not found');
        }
      });
    });
  } else {
    // If no image is uploaded, update only the price
    const updateQuery = 'UPDATE fruit SET buy_price= ?, sale_price = ? WHERE f_id = ?';
    conn.query(updateQuery, [buy_price, sale_price, f_id], (err, results) => {
      if (err) {
        console.error('เกิดข้อผิดพลาดในการอัปเดตข้อมูล: ' + err.stack);
        return res.status(500).send('Internal Server Error');
      }

      console.log('อัปเดตข้อมูลเรียบร้อย');
      const selectQuery = 'SELECT * FROM fruit WHERE f_id = ?';
      conn.query(selectQuery, [f_id], (err, rows) => {
        if (err) {
          console.error('เกิดข้อผิดพลาดในการดึงข้อมูลใหม่: ' + err.stack);
          return res.status(500).send('Internal Server Error');
        }

        if (rows.length > 0) {
          console.log(rows);
          return res.render('emp/editpd', { user: req.session.user, e: 'ss', fruits: rows[0] });
        } else {
          return res.status(404).send('Data not found');
        }
      });
    });
  }
});


router.get('/recive', (req, res) => {
  if (!req.session.user) {
    return res.redirect('/loginadmin');
  }
  res.render('emp/recive', { user: req.session.user });
});

router.get('/reciveFruit', (req, res) => {
  const sql = 'SELECT * FROM fruit';
  conn.query(sql, (err, result) => {
    if (err) {
      console.error('Error querying the database:', err);
      return res.status(500).json({ error: 'Error querying the database' });
    }
    const fruits = result;
    res.json(fruits);
  });
});

router.post('/recive', async (req, res) => {
  if (!req.session.user) {
    return res.redirect('/loginadmin');
  }

  const { f_ids, f_inputs } = req.body;

  let connection;

  try {
    // Acquire a connection from the pool
    connection = await pool.getConnection();

    // Start the transaction
    await connection.beginTransaction();

    // 1. Get the last recive_id from the recive table
    const getLastReciveIdQuery = 'SELECT recive_id FROM recive ORDER BY recive_id DESC LIMIT 1';
    const [result] = await connection.query(getLastReciveIdQuery);

    let reciveId;
    if (result.length === 0) {
      reciveId = 'RC001';
    } else {
      const lastReciveId = result[0].recive_id;
      const numericPart = parseInt(lastReciveId.substr(2));
      reciveId = 'RC' + ('000' + (numericPart + 1)).slice(-3);
    }

    // 2. Insert data into the recive table
    const insertReciveQuery = 'INSERT INTO recive (recive_id, recive_date) VALUES (?, NOW())';
    await connection.query(insertReciveQuery, [reciveId]);

    // 3. Loop through f_ids and f_inputs to update fruit and insert into recive_detail
    const updateQuery = 'UPDATE fruit SET balance = balance + ? WHERE f_id = ?';
    const insertReciveDetailQuery = 'INSERT INTO recive_detail (recive_id, f_id, quantity) VALUES (?, ?, ?)';

    // Check if req.body.f_ids and req.body.f_inputs are arrays with length properties
    if (
      Array.isArray(f_ids) &&
      Array.isArray(f_inputs)
    ) {
      for (let i = 0; i < req.body.f_ids.length; i++) {
        const f_id = req.body.f_ids[i];
        const f_input = req.body.f_inputs[i];

        // 4. Update the fruit table
        const [updateResults] = await connection.query(updateQuery, [f_input, f_id]);
        if (updateResults.affectedRows !== 1) {
          throw new Error('Error updating data in fruit table');
        }

        // 5. Insert into recive_detail
        const [insertResults] = await connection.query(insertReciveDetailQuery, [reciveId, f_id, f_input]);
        if (insertResults.affectedRows !== 1) {
          throw new Error('Error inserting data into recive_detail table');
        }
      }
    } else {
      // Handle the case when req.body.f_ids or req.body.f_inputs are not arrays or have different lengths
      console.error('Invalid or empty req.body.f_ids or req.body.f_inputs');
      throw new Error('Invalid or empty req.body.f_ids or req.body.f_inputs');
    }

    // Commit the transaction
    await connection.commit();
    res.json({ success: true, message: 'บันทึกสำเร็จ' });
  } catch (error) {
    // Rollback the transaction if there's an error
    if (connection) {
      await connection.rollback();
    }

    console.error('Error during recive:', error);
    res.status(500).send('Internal Server Error');
  } finally {
    // Always release the connection back to the pool
    if (connection) {
      connection.release();
    }
  }
});




router.get('/addCart/:productId', (req, res) => {
  if (!req.session.user) {
    return res.redirect('/login');
  }
  if (req.session.user.position) {
    return res.redirect('/?e=n');
  }
  const productId = req.params.productId;
  const getCus = req.session.user.cus_id;
  const getpd = 'SELECT * FROM fruit WHERE f_id = ?';
  conn.query(getpd, [productId], (err, result) => {
    if (err) {
      return res.status(500).send('Internal Server Error 1');
    }
    if (result.length > 0) {
      const price = result[0].sale_price;
      const chkCart = 'SELECT cus_id, f_id FROM cart WHERE cus_id = ? AND f_id = ?';
      conn.query(chkCart, [getCus, productId], (err, result) => {
        if (err) {
          return res.status(500).send('Internal Server Error 2');
        }
        if (result.length > 0) {
          const upCart = 'UPDATE cart SET qty = qty + 1, total = price * qty WHERE cus_id = ? AND f_id = ?';
          conn.query(upCart, [getCus, productId], (err, result) => {
            if (err) {
              return res.status(500).send('Internal Server Error 3 ');
            }
            res.redirect('/');
          })
        } else {
          const addc = 'INSERT INTO cart VALUES(?, ?, ?, ?, ?)';
          conn.query(addc, [getCus, productId, price, 1, price * 1], (err, result) => {
            if (err) {
              return res.status(500).send('Internal Server Error 4' + err);
            }
            res.redirect('/');
          })
        }
      })

    }
  })

});

router.get('/cart', (req, res) => {
  if (!req.session.user) {
    return res.redirect('/login');
  }
  const getCus = req.session.user.cus_id;
  const getcart = 'SELECT cart.*, fruit.f_img, fruit.f_name, fruit.balance FROM cart INNER JOIN fruit ON fruit.f_id = cart.f_id WHERE cus_id = ?';
  conn.query(getcart, [getCus], (err, result) => {
    if (err) {
      return res.status(500).send('Internal Server Error');
    }
    if (result.length > 0) {
      res.render('customer/cart', { user: req.session.user, cart: result });
    } else {
      res.render('customer/cart', { user: req.session.user, cart: null });
    }

  })
})
router.get('/delcart/:id', (req, res) => {
  if (!req.session.user) {
    return res.redirect('/login');
  }
  const id = req.params.id;
  const delcart = 'DELETE FROM cart WHERE f_id = ?';
  conn.query(delcart, [id], (err, result) => {
    if (err) {
      return res.status(500).send('Internal Server Error' + err);
    }
    res.redirect('/cart');
  })
})
router.post('/checkout', (req, res) => {
  if (!req.session.user) {
    return res.redirect('/login');
  }
  const { f_id, price, qty } = req.body;

  const cusId = req.session.user.cus_id;
  console.log(price);
  if (!f_id || !price || !qty) {
    return res.status(400).send('Invalid data received');
  }
  let net = 0;
  const sqlId = 'SELECT or_id FROM orders ORDER BY or_id DESC LIMIT 1';
  conn.query(sqlId, (err, results) => {
    if (err) {
      return res.status(500).send(err);
    }
    let lastOrId = 0;
    if (results.length > 0) {
      lastOrId = parseInt(results[0].or_id.substr(3));
    }
    const newOId = 'OR' + ('000' + (lastOrId + 1)).slice(-3);
    const sqlOr = 'INSERT INTO orders(or_id, cus_id, or_total, or_status) VALUES(?, ?, ?, ?)';
    const sqlOrdetail = 'INSERT INTO orders_detail VALUES(?, ?, ?, ?)';
    if (Array.isArray(f_id)) {
      for (let i = 0; i < f_id.length; i++) {
        let total = price[i] * qty[i];
        conn.query(sqlOrdetail, [newOId, f_id[i], qty[i], total], (err, result) => {
          if (err) {
            return res.status(500).send(err);
          }

        })
        net += total;
      }
    } else {
      let total = price * qty;
      conn.query(sqlOrdetail, [newOId, f_id, qty, total], (err, result) => {
        if (err) {
          return res.status(500).send(err);
        }

      })
      net += total;
    }

    conn.query(sqlOr, [newOId, cusId, net, '1'], (err, result) => {
      if (err) {
        return res.status(500).send(err);
      }
    })
    const delCart = 'DELETE FROM cart WHERE cus_id = ?';
    conn.query(delCart, [cusId], (err, results) => {
      if (err) {
        return res.status(500).send(err);
      }
    })
    return res.redirect('/myorders');
  })
});

router.get('/myorders', (req, res) => {
  if (!req.session.user) {
    return res.redirect('/login');
  }
  const cusId = req.session.user.cus_id;
  const sqlOr = 'SELECT * FROM orders WHERE cus_id = ? ORDER BY or_date DESC'
  conn.query(sqlOr, [cusId], (err, rs) => {
    if (err) {
      return res.status(500).send(err)
    }
    return res.render('customer/myorders', { user: req.session.user, myOr: rs });
  })
})
router.get('/cancelpayment/:id', (req, res) => {
  if (!req.session.user) {
    return res.redirect('/login');
  }
  const orId = req.params.id;
  const cusId = req.session.user.cus_id;
  const sqlccOr = 'UPDATE orders SET or_status = "0" WHERE cus_id = ? AND or_id = ?'
  conn.query(sqlccOr, [cusId, orId], (err, rs) => {
    if (err) {
      return res.status(500).send(err)
    }
    return res.redirect('/myorders');
  })
})
router.get('/myorders/:id', (req, res) => {
  if (!req.session.user) {
    return res.redirect('/login');
  }
  const orId = req.params.id;
  const cusId = req.session.user.cus_id;
  const sqlOr = 'SELECT  orders.*, orders_detail.f_id, orders_detail.qty, orders_detail.total, fruit.* FROM (( orders_detail INNER JOIN fruit ON orders_detail.f_id =  fruit.f_id)INNER JOIN orders ON orders_detail.or_id =  orders.or_id) WHERE orders.or_id = ?';
  conn.query(sqlOr, [orId], (err, rs) => {
    if (err) {
      return res.status(500).send(err)
    }
    return res.render('customer/ordersdetail', { user: req.session.user, myOr: rs, net: 0 });
  })
})
router.get('/payment/:id', (req, res) => {
  if (!req.session.user) {
    return res.redirect('/login');
  }
  const orId = req.params.id;
  const sql = 'SELECT orders.*, orders_detail.*, fruit.f_name, fruit.f_img, fruit.sale_price FROM orders LEFT JOIN orders_detail ON orders_detail.or_id = orders.or_id LEFT JOIN fruit ON orders_detail.f_id = fruit.f_id WHERE orders.or_id = ?';

  const query = 'SELECT * FROM payments ORDER BY pay_id DESC LIMIT 1';
  conn.query(query, (err, results) => {
    if (err) {
      console.error('Error querying the database:', err);
      return res.status(500).send('Error querying the database');
    }
    let lastpId = 0;
    if (results.length > 0) {
      lastpId = parseInt(results[0].pay_id.substr(3));
    }
    const newPayId = 'PY' + ('000' + (lastpId + 1)).slice(-3);
    conn.query(sql, [orId], (err, rs) => {
      if (err) {
        return res.status(500).send(err)
      }
      return res.render('customer/mypayment', { user: req.session.user, myOr: rs, payId: newPayId })
    })
  })
})
router.post('/payments', upload.single('f_img'), async (req, res) => {
  if (!req.session.user) {
    res.redirect('/login');
  }
  const { pay_id, or_id, date_pay } = req.body;
  const cusId = req.session.user.cus_id;
  const imgPath = path.basename(req.file.path);
  const sql = 'INSERT INTO payments(pay_id, or_id, transfer_date, pay_img) VALUES (?, ?, ?, ?)';
  const sqlup = 'UPDATE orders SET or_status = 2 WHERE or_id = ? AND cus_id = ?';
  conn.query(sql, [pay_id, or_id, date_pay, imgPath], (err, rs) => {
    if (err) {
      return res.status(500).send(err);
    }
    conn.query(sqlup, [or_id, cusId], (err, rs) => {
      if (err) {
        return res.status(500).send(err);
      }
      return res.redirect('/myorders')
    })

  })
})
router.get('/orederslist', (req, res) => {
  if (!req.session.user) {
    return res.redirect('/loginadmin');
  }
  const sqlOr = 'SELECT * FROM orders'
  conn.query(sqlOr, (err, rs) => {
    if (err) {
      return res.status(500).send(err)
    }
    return res.render('emp/orderslist', { user: req.session.user, myOr: rs });
  })
})
router.get('/cusorders/:id', (req, res) => {
  if (!req.session.user) {
    return res.redirect('/loginadmin');
  }
  const orId = req.params.id;
  var sqlOr = 'SELECT orders.*, orders_detail.*, fruit.f_name, fruit.f_img, fruit.sale_price, customer.*';
  sqlOr += ' FROM orders LEFT JOIN orders_detail ON orders_detail.or_id = orders.or_id ';
  sqlOr += 'LEFT JOIN fruit ON orders_detail.f_id = fruit.f_id LEFT JOIN customer ON orders.cus_id = customer.cus_id WHERE orders.or_id = ?';
  conn.query(sqlOr, [orId], (err, rs) => {
    if (err) {
      return res.status(500).send(err)
    }
    const sqlPay = 'SELECT * FROM payments WHERE or_id = ?';
    conn.query(sqlPay, [orId], (err, rss) => {
      if (rs.length > 0) {
        payData = rss[0];
      } else {
        payData = null;
      }

      return res.render('emp/cusorders', { user: req.session.user, myOr: rs, net: 0, pay_data: payData });
    })

  })
})


router.post('/cfpayments', (req, res) => {
  if (!req.session.user) {
    return res.redirect('/loginadmin');
  }
  const { or_id, qty, fid } = req.body;
  const sql = 'UPDATE orders SET or_status = 3 WHERE or_id = ?';
  const sql2 = 'UPDATE fruit SET balance = balance - ? WHERE f_id = ?'
  if (Array.isArray(qty)) {
    for (let i = 0; i < qty.length; i++) {
      conn.query(sql2, [qty[i], fid[i]], (err, result) => {
        if (err) {
          return res.status(500).send(err);
        }
      })
    }
    conn.query(sql, [or_id], (err, result) => {
      if (err) {
        return res.status(500).send(err);
      }
    })
  } else {
    conn.query(sql2, [qty, fid], (err, result) => {
      if (err) {
        return res.status(500).send(err);
      }
    })
    conn.query(sql, [or_id], (err, result) => {
      if (err) {
        return res.status(500).send(err);
      }
    })
  }
  return res.redirect('/orederslist');
})
router.get('/shipping', (req, res) => {
  if (!req.session.user) {
    return res.redirect('/loginadmin');
  }
  const sqlOr = 'SELECT * FROM orders'
  conn.query(sqlOr, (err, rs) => {
    if (err) {
      return res.status(500).send(err)
    }
    return res.render('emp/shipping', { user: req.session.user, myOr: rs });
  })
})
router.post('/saveShipping', (req, res) => {
  const {
    companyName,
    deliveryDate,
    trackingNumber,
    orderId,
  } = req.body;

  // ตรวจสอบว่า ship_id มีอยู่ในฐานข้อมูลหรือไม่
  const selectQuery = 'SELECT MAX(ship_id) AS max_ship_id FROM shipping';
  conn.query(selectQuery, (err, result) => {
    if (err) {
      console.error('เกิดข้อผิดพลาดในการดำเนินการคำสั่ง SELECT:', err);
      return res.status(500).send('ข้อผิดพลาดภายในเซิร์ฟเวอร์');
    }

    let shipId;
    if (result && result[0].max_ship_id) {
      // หาก ship_id มีอยู่แล้ว ให้เพิ่มขึ้นอีก 1
      const lastShipId = result[0].max_ship_id;
      const numericPart = parseInt(lastShipId.slice(2), 10) + 1;
      shipId = 'SH' + numericPart.toString().padStart(3, '0');
    } else {
      // หากไม่มี ship_id ในฐานข้อมูล ให้สร้าง SH001
      shipId = 'SH001';
    }

    // แทรกข้อมูลการจัดส่งลงในฐานข้อมูล
    const insertQuery = `
      INSERT INTO shipping (ship_id, company_name, ship_date, tracking_id, or_id)
      VALUES (?, ?, ?, ?, ?)
    `;

    const values = [shipId, companyName, deliveryDate, trackingNumber, orderId];

    conn.query(insertQuery, values, (err) => {
      if (err) {
        console.error('เกิดข้อผิดพลาดในการดำเนินการ INSERT:', err);
        return res.status(500).send('ข้อผิดพลาดภายในเซิร์ฟเวอร์');
      }

      // อัพเดทสถานะในตาราง orders เป็น 4
      const updateOrderStatusQuery = 'UPDATE orders SET or_status = 4 WHERE or_id = ?';
      conn.query(updateOrderStatusQuery, [orderId], (err) => {
        if (err) {
          console.error('เกิดข้อผิดพลาดในการดำเนินการ UPDATE สถานะ:', err);
          return res.status(500).send('ข้อผิดพลาดภายในเซิร์ฟเวอร์');
        }

        // ส่งข้อความความสำเร็จ
        res.status(200).send({ success: true, shipId });
      });
    });
  });
});
router.get('/recive_report', (req, res) => {
  if (!req.session.user) {
    return res.redirect('/loginadmin');
  }
  res.render('emp/recive_report', { user: req.session.user }); // Pass your report data here
});

router.post('/get_data_recive', (req, res) => {
  try {
    const { startDate, endDate } = req.body;

    // ใส่โค้ด SQL ที่ใช้ในการดึงข้อมูล recive และ recive_detail ตามช่วงวันที่
    const query = `
      SELECT recive.*, recive_detail.*, fruit.f_name
      FROM recive
      JOIN recive_detail ON recive.recive_id = recive_detail.recive_id
      JOIN fruit ON recive_detail.f_id = fruit.f_id
      WHERE recive.recive_date BETWEEN ? AND ? ORDER BY recive_detail.recive_id ASC
    `;

    const queryParams = [startDate, endDate];

    conn.query(query, queryParams, (error, results) => {
      if (error) {
        console.error('Error fetching data from MySQL:', error);
        res.status(500).send('Internal Server Error');
        return;
      }

      // ส่งข้อมูลที่ได้กลับไปยัง client
      res.json(results);
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Internal Server Error');
  }
});

router.get('/fruit_report', (req, res) => {
  if (!req.session.user) {
    return res.redirect('/loginadmin');
  }
  res.render('emp/fruit_report', { user: req.session.user }); // Pass your report data here
});

router.get('/get_data_fruit', (req, res) => {
  try {
    const { startDate, endDate } = req.body;

    // ใส่โค้ด SQL ที่ใช้ในการดึงข้อมูล recive และ recive_detail ตามช่วงวันที่
    const query = `
      SELECT * FROM fruit
    `;

    conn.query(query, (error, results) => {
      if (error) {
        console.error('Error fetching data from MySQL:', error);
        res.status(500).send('Internal Server Error');
        return;
      }

      // ส่งข้อมูลที่ได้กลับไปยัง client
      res.json(results);
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Internal Server Error');
  }
});

router.get('/order_report', (req, res) => {
  if (!req.session.user) {
    return res.redirect('/loginadmin');
  }
  res.render('emp/order_report', { user: req.session.user }); // Pass your report data here
});

router.post('/get_data_order', (req, res) => {
  try {
    const { startDate, endDate } = req.body;

    // ใส่โค้ด SQL ที่ใช้ในการดึงข้อมูล recive และ recive_detail ตามช่วงวันที่
    const query = `
      SELECT orders.*, customer.name
      FROM orders
      JOIN customer ON orders.cus_id = customer.cus_id
      WHERE orders.or_date BETWEEN ? AND ? 
    `;

    const queryParams = [startDate, endDate];

    conn.query(query, queryParams, (error, results) => {
      if (error) {
        console.error('Error fetching data from MySQL:', error);
        res.status(500).send('Internal Server Error');
        return;
      }

      // ส่งข้อมูลที่ได้กลับไปยัง client
      res.json(results);
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Internal Server Error');
  }
});

router.get('/payment_report', (req, res) => {
  if (!req.session.user) {
    return res.redirect('/loginadmin');
  }
  res.render('emp/payment_report', { user: req.session.user }); // Pass your report data here
});

router.post('/get_data_payment', (req, res) => {
  try {
    const { startDate, endDate } = req.body;

    // ใส่โค้ด SQL ที่ใช้ในการดึงข้อมูล recive และ recive_detail ตามช่วงวันที่
    const query = `
      SELECT *
      FROM payments
      WHERE pay_date BETWEEN ? AND ? 
    `;

    const queryParams = [startDate, endDate];

    conn.query(query, queryParams, (error, results) => {
      if (error) {
        console.error('Error fetching data from MySQL:', error);
        res.status(500).send('Internal Server Error');
        return;
      }

      // ส่งข้อมูลที่ได้กลับไปยัง client
      res.json(results);
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Internal Server Error');
  }
});

router.get('/shipping_report', (req, res) => {
  if (!req.session.user) {
    return res.redirect('/loginadmin');
  }
  res.render('emp/shipping_report', { user: req.session.user }); // Pass your report data here
});

router.post('/get_data_shipping', (req, res) => {
  try {
    const { startDate, endDate } = req.body;

    // ใส่โค้ด SQL ที่ใช้ในการดึงข้อมูล recive และ recive_detail ตามช่วงวันที่
    const query = `
      SELECT *
      FROM shipping
      WHERE ship_date BETWEEN ? AND ? 
    `;

    const queryParams = [startDate, endDate];

    conn.query(query, queryParams, (error, results) => {
      if (error) {
        console.error('Error fetching data from MySQL:', error);
        res.status(500).send('Internal Server Error');
        return;
      }

      // ส่งข้อมูลที่ได้กลับไปยัง client
      res.json(results);
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Internal Server Error');
  }
});



router.post('/generate-pdf-recive', (req, res) => {
  const { startDate, endDate } = req.body;

  // ใส่โค้ด SQL ที่ใช้ในการดึงข้อมูล recive และ recive_detail ตามช่วงวันที่
  const query = `
    SELECT recive.*, recive_detail.*, fruit.f_name
    FROM recive
    JOIN recive_detail ON recive.recive_id = recive_detail.recive_id
    JOIN fruit ON recive_detail.f_id = fruit.f_id
    WHERE recive.recive_date BETWEEN ? AND ? ORDER BY recive_detail.recive_id ASC
  `;

  const queryParams = [startDate, endDate];

  // Execute the SQL query and fetch data from the database
  conn.query(query, queryParams, (error, results) => {
    if (error) {
      console.error('Error executing SQL query:', error);
      res.status(500).send('Internal Server Error');
      return;
    }

    // Extract relevant data from the query results
    const data = results;

    // Render the EJS template with the provided data
    ejs.renderFile('./views/report/recive_report_pdf.ejs', { data, net:0, sdate:startDate, eDate:endDate  }, (err, html) => {
      if (err) {
        console.error('Error rendering EJS template:', err);
        res.status(500).send('Internal Server Error');
        return;
      }

      // Create PDF using html-pdf-node
      const pdf = require('html-pdf-node');
      const options = {
        format: 'A4',
        base: 'file://D:/Program/Xampp/htdocs/projectfinal/public/img/'
      };
    
      pdf.generatePdf({ content: html }, options)
        .then(pdfBuffer => {
          res.setHeader('Content-Type', 'application/pdf');
          res.setHeader('Content-Disposition', 'attachment; filename=report.pdf');
          res.send(pdfBuffer);
        })
        .catch(error => {
          console.error('Error generating PDF:', error);
          res.status(500).send('Internal Server Error');
        });
    });
  });
});




router.post('/generate-pdf-fruit', (req, res) => {
  

  // ใส่โค้ด SQL ที่ใช้ในการดึงข้อมูล recive และ recive_detail ตามช่วงวันที่
  const query = `
  SELECT * FROM fruit
  `;


  // Execute the SQL query and fetch data from the database
  conn.query(query, (error, results) => {
    if (error) {
      console.error('Error executing SQL query:', error);
      res.status(500).send('Internal Server Error');
      return;
    }

    // Extract relevant data from the query results
    const data = results;

    // Render the EJS template with the provided data
    ejs.renderFile('./views/report/fruit_report_pdf.ejs', { data, net:0, c_total:0}, (err, html) => {
      if (err) {
        console.error('Error rendering EJS template:', err);
        res.status(500).send('Internal Server Error');
        return;
      }

      // Create PDF using html-pdf-node
      const pdf = require('html-pdf-node');
      const options = {
        format: 'A4',
        base: 'file://D:/Program/Xampp/htdocs/projectfinal/public/img/'
      };
    
      pdf.generatePdf({ content: html }, options)
        .then(pdfBuffer => {
          res.setHeader('Content-Type', 'application/pdf');
          res.setHeader('Content-Disposition', 'attachment; filename=report.pdf');
          res.send(pdfBuffer);
        })
        .catch(error => {
          console.error('Error generating PDF:', error);
          res.status(500).send('Internal Server Error');
        });
    });
  });
});

router.post('/generate-pdf-order', (req, res) => {
  const { startDate, endDate } = req.body;

  // ใส่โค้ด SQL ที่ใช้ในการดึงข้อมูล recive และ recive_detail ตามช่วงวันที่
  const query = `
  SELECT orders.*, customer.name
  FROM orders
  JOIN customer ON orders.cus_id = customer.cus_id
  WHERE orders.or_date BETWEEN ? AND ? 
  `;

  const queryParams = [startDate, endDate];

  // Execute the SQL query and fetch data from the database
  conn.query(query, queryParams, (error, results) => {
    if (error) {
      console.error('Error executing SQL query:', error);
      res.status(500).send('Internal Server Error');
      return;
    }

    // Extract relevant data from the query results
    const data = results;

    // Render the EJS template with the provided data
    ejs.renderFile('./views/report/order_report_pdf.ejs', { data, net:0, sDate:startDate, eDate:endDate  }, (err, html) => {
      if (err) {
        console.error('Error rendering EJS template:', err);
        res.status(500).send('Internal Server Error');
        return;
      }

      // Create PDF using html-pdf-node
      const pdf = require('html-pdf-node');
      const options = {
        format: 'A4',
        base: 'file://D:/Program/Xampp/htdocs/projectfinal/public/img/'
      };
    
      pdf.generatePdf({ content: html }, options)
        .then(pdfBuffer => {
          res.setHeader('Content-Type', 'application/pdf');
          res.setHeader('Content-Disposition', 'attachment; filename=report.pdf');
          res.send(pdfBuffer);
        })
        .catch(error => {
          console.error('Error generating PDF:', error);
          res.status(500).send('Internal Server Error');
        });
    });
  });
});

router.post('/generate-pdf-payment', (req, res) => {
  const { startDate, endDate } = req.body;

  // ใส่โค้ด SQL ที่ใช้ในการดึงข้อมูล recive และ recive_detail ตามช่วงวันที่
  const query = `
  SELECT *
  FROM payments
  WHERE pay_date BETWEEN ? AND ? 
  `;

  const queryParams = [startDate, endDate];

  // Execute the SQL query and fetch data from the database
  conn.query(query, queryParams, (error, results) => {
    if (error) {
      console.error('Error executing SQL query:', error);
      res.status(500).send('Internal Server Error');
      return;
    }

    // Extract relevant data from the query results
    const data = results;

    // Render the EJS template with the provided data
    ejs.renderFile('./views/report/payment_report_pdf.ejs', { data, net:0, sDate:startDate, eDate:endDate  }, (err, html) => {
      if (err) {
        console.error('Error rendering EJS template:', err);
        res.status(500).send('Internal Server Error');
        return;
      }

      // Create PDF using html-pdf-node
      const pdf = require('html-pdf-node');
      const options = {
        format: 'A4',
        base: 'file://D:/Program/Xampp/htdocs/projectfinal/public/img/'
      };
    
      pdf.generatePdf({ content: html }, options)
        .then(pdfBuffer => {
          res.setHeader('Content-Type', 'application/pdf');
          res.setHeader('Content-Disposition', 'attachment; filename=report.pdf');
          res.send(pdfBuffer);
        })
        .catch(error => {
          console.error('Error generating PDF:', error);
          res.status(500).send('Internal Server Error');
        });
    });
  });
});

router.post('/generate-pdf-shipping', (req, res) => {
  const { startDate, endDate } = req.body;

  // ใส่โค้ด SQL ที่ใช้ในการดึงข้อมูล recive และ recive_detail ตามช่วงวันที่
  const query = `
  SELECT *
  FROM shipping
  WHERE ship_date BETWEEN ? AND ? 
  `;

  const queryParams = [startDate, endDate];

  // Execute the SQL query and fetch data from the database
  conn.query(query, queryParams, (error, results) => {
    if (error) {
      console.error('Error executing SQL query:', error);
      res.status(500).send('Internal Server Error');
      return;
    }

    // Extract relevant data from the query results
    const data = results;

    // Render the EJS template with the provided data
    ejs.renderFile('./views/report/shipping_report_pdf.ejs', { data, net:0, sdate:startDate, eDate:endDate  }, (err, html) => {
      if (err) {
        console.error('Error rendering EJS template:', err);
        res.status(500).send('Internal Server Error');
        return;
      }

      // Create PDF using html-pdf-node
      const pdf = require('html-pdf-node');
      const options = {
        format: 'A4',
        base: 'file://D:/Program/Xampp/htdocs/projectfinal/public/img/'
      };
    
      pdf.generatePdf({ content: html }, options)
        .then(pdfBuffer => {
          res.setHeader('Content-Type', 'application/pdf');
          res.setHeader('Content-Disposition', 'attachment; filename=report.pdf');
          res.send(pdfBuffer);
        })
        .catch(error => {
          console.error('Error generating PDF:', error);
          res.status(500).send('Internal Server Error');
        });
    });
  });
});


module.exports = router;