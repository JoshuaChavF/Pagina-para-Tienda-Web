const express = require('express');
const path = require('path');
const mysql = require('mysql2');

const app = express();
const port = 3000;

// Configuración para usar archivos estáticos desde la carpeta 'public'
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());  // Para poder recibir datos en formato JSON

// Crear la conexión a la base de datos MySQL
const connection = mysql.createConnection({
    host: 'localhost',    // Cambia a la IP del servidor si no es local
    user: 'root',         // Usuario que configuraste
    password: 'nueva_contraseña',         // Contraseña que configuraste
    database: 'Oulet'     // Nombre de la base de datos
});

// Conectar a la base de datos
connection.connect((err) => {
    if (err) {
        console.error('Error al conectar a MySQL:', err);
        return;
    }
    console.log('Conectado a MySQL');
});

// Ruta para obtener todos los artículos
app.get('/articulos', (req, res) => {
    connection.query('SELECT * FROM Articulo', (err, results) => {
        if (err) {
            return res.status(500).send('Error en la consulta');
        }
        res.json(results);
    });
});

// Nueva ruta para guardar ventas diarias
app.post('/guardar-ventas', (req, res) => {
    const { fecha, totalPrecioFinal, totalEfectivo, totalSINPE, totalTarjeta } = req.body;

    const query = `
        INSERT INTO ventas_diarias (fecha, total_final, total_efectivo, total_sinpe, total_tarjeta)
        VALUES (?, ?, ?, ?, ?)
    `;

    connection.query(query, [fecha, totalPrecioFinal, totalEfectivo, totalSINPE, totalTarjeta], (error, results) => {
        if (error) {
            console.error('Error al guardar ventas:', error);
            res.status(500).json({ error: 'Error al guardar las ventas' });
        } else {
            res.json({ success: 'Ventas guardadas correctamente' });
        }
    });
});

// Ruta para obtener los productos
app.get('/productos', (req, res) => {
    // Asegúrate de que esta consulta sea correcta
    const query = 'SELECT codigo, nombre, precio, cantidad FROM Productos';
    connection.query(query, (err, results) => {
        if (err) {
            console.error('Error en la consulta:', err);
            res.status(500).send('Error en la consulta a la base de datos');
            return;
        }
        res.json(results); // Devuelve los productos como JSON
    });
});

// Ruta para obtener un solo producto por ID
app.get('/productos/:id', (req, res) => {
    const id = req.params.id;
    connection.query('SELECT * FROM productos WHERE codigo = ?', [id], (error, results) => {
        if (error) throw error;
        if (results.length > 0) {
            res.json(results[0]);
        } else {
            res.status(404).json({ message: 'Producto no encontrado' });
        }
    });
});

// Ruta para agregar un nuevo producto
app.post('/productos', (req, res) => {
    const { nombre, precio, cantidad, ubicacion } = req.body;
    const sql = 'INSERT INTO Productos (nombre, precio, cantidad, ubicacion) VALUES (?, ?, ?, ?)';
    connection.query(sql, [nombre, precio, cantidad, ubicacion], (err, result) => {
        if (err) {
            console.error('Error al agregar producto:', err);
            return res.status(500).send('Error al agregar el producto');
        }
        res.json({ message: 'Producto agregado correctamente' });
    });
});

// Ruta para actualizar un producto
app.put('/productos/:id', (req, res) => {
    const { nombre, precio, cantidad, ubicacion } = req.body;
    const sql = 'UPDATE Productos SET nombre = ?, precio = ?, cantidad = ?, ubicacion = ? WHERE id = ?';
    connection.query(sql, [nombre, precio, cantidad, ubicacion, id], (err, result) => {
        if (err) {
            console.error('Error al actualizar producto:', err);
            return res.status(500).send('Error al actualizar el producto');
        }
        res.json({ message: 'Producto actualizado correctamente' });
    });
});

// Ruta para eliminar un producto
app.delete('/productos/:id', (req, res) => {
    const { id } = req.params;
    const sql = 'DELETE FROM Articulo WHERE id = ?';
    connection.query(sql, [id], (err, result) => {
        if (err) {
            console.error('Error al eliminar producto:', err);
            return res.status(500).send('Error al eliminar el producto');
        }
        res.json({ message: 'Producto eliminado correctamente' });
    });
});

// Ruta para la página principal
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/inventario.html', (req, res) => {
    res.sendFile(__dirname + '/public/inventario.html'); // Ajusta la ruta según sea necesario
});

// Iniciar el servidor
app.listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${port}`);
});