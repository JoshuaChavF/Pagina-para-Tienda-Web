// Mostrar la fecha actual del ordenador
const fecha = new Date();
document.getElementById('fecha-actual').innerText = 'Fecha: ' + fecha.toLocaleDateString();

// Función para actualizar los precios finales y totales
function actualizarTotales() {
    let totalPrecioFinal = 0;
    let totalEfectivo = 0;
    let totalSINPE = 0;
    let totalTarjeta = 0;

    document.querySelectorAll('.fila-venta').forEach(fila => {
        const cantidad = parseFloat(fila.querySelector('.cantidad').value) || 0;
        const precio = parseFloat(fila.querySelector('.precio').value) || 0;
        const descuento = parseFloat(fila.querySelector('.descuento').value) || 0;
        const precioFinal = cantidad * precio * (1 - descuento / 100);

        fila.querySelector('.precio-final').innerText = precioFinal.toFixed(2);
        totalPrecioFinal += precioFinal;

        if (fila.querySelector('.efectivo').checked) totalEfectivo += precioFinal;
        if (fila.querySelector('.sinpe').checked) totalSINPE += precioFinal;
        if (fila.querySelector('.tarjeta').checked) totalTarjeta += precioFinal;
    });

    document.getElementById('total-precio-final').innerText = totalPrecioFinal.toFixed(2);
    document.getElementById('total-efectivo').innerText = totalEfectivo.toFixed(2);
    document.getElementById('total-sinpe').innerText = totalSINPE.toFixed(2);
    document.getElementById('total-tarjeta').innerText = totalTarjeta.toFixed(2);
}

// Añadir evento para cambiar solo un check por fila
function configurarCheckboxes(fila) {
    const efectivo = fila.querySelector('.efectivo');
    const sinpe = fila.querySelector('.sinpe');
    const tarjeta = fila.querySelector('.tarjeta');

    efectivo.addEventListener('change', () => {
        if (efectivo.checked) {
            sinpe.checked = false;
            tarjeta.checked = false;
        }
        actualizarTotales();
    });

    sinpe.addEventListener('change', () => {
        if (sinpe.checked) {
            efectivo.checked = false;
            tarjeta.checked = false;
        }
        actualizarTotales();
    });

    tarjeta.addEventListener('change', () => {
        if (tarjeta.checked) {
            efectivo.checked = false;
            sinpe.checked = false;
        }
        actualizarTotales();
    });
}

// Configurar la fila inicial
configurarCheckboxes(document.querySelector('.fila-venta'));

// Agregar una nueva fila de producto
document.getElementById('btn-agregar-fila').addEventListener('click', () => {
    const nuevaFila = document.createElement('tr');
    nuevaFila.classList.add('fila-venta');
    nuevaFila.innerHTML = `
        <td><input type="number" class="cantidad" value="1" min="1"></td>
        <td><input type="text" class="producto"></td>
        <td><input type="number" class="precio" value="0" min="0"></td>
        <td><input type="number" class="descuento" value="0" min="0" max="100"></td>
        <td><span class="precio-final">0</span></td>
        <td><input type="checkbox" class="efectivo"></td>
        <td><input type="checkbox" class="sinpe"></td>
        <td><input type="checkbox" class="tarjeta"></td>
    `;
    document.getElementById('tabla-ventas').appendChild(nuevaFila);
    configurarCheckboxes(nuevaFila);
});

// Actualizar totales cuando se cambien los valores de cantidad, precio o descuento
document.addEventListener('input', (event) => {
    if (event.target.classList.contains('cantidad') || event.target.classList.contains('precio') || event.target.classList.contains('descuento')) {
        actualizarTotales();
    }
});

// Botón para guardar las ventas diarias
document.getElementById('btn-guardar').addEventListener('click', () => {
    const fechaActual = fecha.toISOString().split('T')[0];
    const totalFinal = parseFloat(document.getElementById('total-precio-final').innerText) || 0;
    const totalEfectivo = parseFloat(document.getElementById('total-efectivo').innerText) || 0;
    const totalSINPE = parseFloat(document.getElementById('total-sinpe').innerText) || 0;
    const totalTarjeta = parseFloat(document.getElementById('total-tarjeta').innerText) || 0;

    // Enviar los datos al servidor usando fetch
    fetch('/guardar-ventas', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            fecha: fechaActual,
            total_final: totalFinal,
            total_efectivo: totalEfectivo,
            total_sinpe: totalSINPE,
            total_tarjeta: totalTarjeta
        })
    })
    .then(response => response.text())
    .then(data => {
        alert(data);
    })
    .catch(error => {
        console.error('Error al guardar las ventas diarias:', error);
    });
});