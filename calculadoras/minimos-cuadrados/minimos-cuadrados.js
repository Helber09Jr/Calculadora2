const App = {
  estado: {
    puntos: [],
    resultado: null
  },

  iniciar() {
    this.renderizarTabla();
    this.actualizarEncabezados();
    this.vincularEventos();
  },

  vincularEventos() {
    document.getElementById('btnAgregarFila').onclick = () => this.agregarFila();
    document.getElementById('btnLimpiarTodo').onclick = () => this.limpiarTodo();
    document.getElementById('btnCalcular').onclick = () => this.calcular();
    document.getElementById('btnEjemplo').onclick = () => this.cargarEjemplo();
    document.getElementById('btnTogglePasos').onclick = () => this.alternarPasos();
    document.getElementById('botonMenu').onclick = () => this.alternarMenu();

    document.getElementById('nombreEjeX').oninput = () => this.actualizarEncabezados();
    document.getElementById('nombreEjeY').oninput = () => this.actualizarEncabezados();
  },

  agregarFila(x = '', y = '') {
    const tbody = document.getElementById('cuerpoTablaPuntos');
    const indice = tbody.children.length;
    const fila = document.createElement('tr');

    fila.innerHTML = `
      <td>${indice}</td>
      <td><input type="number" step="any" class="input-x" value="${x}"></td>
      <td><input type="number" step="any" class="input-y" value="${y}"></td>
      <td><button class="boton-eliminar">X</button></td>
    `;

    fila.querySelector('.boton-eliminar').onclick = () => {
      fila.remove();
      this.renumerarFilas();
      this.leerPuntos();
    };

    fila.querySelector('.input-x').oninput = () => this.leerPuntos();
    fila.querySelector('.input-y').oninput = () => this.leerPuntos();

    tbody.appendChild(fila);
    this.leerPuntos();
  },

  renumerarFilas() {
    const filas = document.querySelectorAll('#cuerpoTablaPuntos tr');
    filas.forEach((fila, i) => {
      fila.firstElementChild.textContent = i;
    });
  },

  renderizarTabla() {
    const tbody = document.getElementById('cuerpoTablaPuntos');
    tbody.innerHTML = '';

    if (this.estado.puntos.length === 0) {
      this.agregarFila('1', '2.5');
      this.agregarFila('2', '5.0');
      this.agregarFila('3', '7.5');
      this.agregarFila('4', '10.0');
    } else {
      this.estado.puntos.forEach(p => {
        this.agregarFila(p.x !== null ? p.x : '', p.y !== null ? p.y : '');
      });
    }
  },

  leerPuntos() {
    const filas = document.querySelectorAll('#cuerpoTablaPuntos tr');
    this.estado.puntos = [];

    filas.forEach(fila => {
      const x = fila.querySelector('.input-x').value.trim();
      const y = fila.querySelector('.input-y').value.trim();

      if (x !== '' || y !== '') {
        this.estado.puntos.push({
          x: x !== '' ? parseFloat(x) : null,
          y: y !== '' ? parseFloat(y) : null
        });
      }
    });
  },

  actualizarEncabezados() {
    const nombreX = document.getElementById('nombreEjeX').value || 'x';
    const nombreY = document.getElementById('nombreEjeY').value || 'y';
    document.querySelector('.encabezado-x').textContent = nombreX;
    document.querySelector('.encabezado-y').textContent = nombreY;
  },

  limpiarTodo() {
    if (confirm('¿Estás seguro de limpiar todos los datos?')) {
      this.estado.puntos = [];
      this.estado.resultado = null;
      this.renderizarTabla();
      document.getElementById('contenedorResultado').innerHTML = '';
      document.getElementById('contenedorDesarrollo').innerHTML = '';
      document.getElementById('graficoMinimos').innerHTML = '';
      document.getElementById('tituloExperimento').value = '';
      document.getElementById('nombreEjeX').value = 'x';
      document.getElementById('nombreEjeY').value = 'y';
      document.getElementById('inputXPredecir').value = '25';
      document.getElementById('gradoPolinomio').value = '2';
      this.actualizarEncabezados();

      const seccion = document.getElementById('seccionDesarrollo');
      if (!seccion.classList.contains('oculto')) {
        seccion.classList.add('oculto');
        seccion.setAttribute('aria-hidden', 'true');
        document.getElementById('btnTogglePasos').textContent = 'Abrir desarrollo';
      }

      alert('Todos los datos han sido limpiados correctamente');
    }
  },

  quitarValidacionVisual() {
    document.querySelectorAll('.input-x, .input-y').forEach(input => {
      input.classList.remove('campo-invalido');
    });
  },

  validar() {
    this.leerPuntos();
    this.quitarValidacionVisual();

    const puntosValidos = this.estado.puntos.filter(p =>
      p.x !== null && !isNaN(p.x) && p.y !== null && !isNaN(p.y)
    );

    if (puntosValidos.length < 2) {
      throw new Error('Se necesitan al menos 2 puntos válidos');
    }

    const grado = parseInt(document.getElementById('gradoPolinomio').value);
    if (puntosValidos.length <= grado) {
      throw new Error(`Para grado ${grado} se necesitan al menos ${grado + 1} puntos`);
    }

    const filas = document.querySelectorAll('#cuerpoTablaPuntos tr');
    filas.forEach((fila, i) => {
      const inputX = fila.querySelector('.input-x');
      const inputY = fila.querySelector('.input-y');
      const punto = this.estado.puntos[i];

      if (!punto) return;

      if (punto.x === null || isNaN(punto.x)) {
        inputX.classList.add('campo-invalido');
      }

      if (punto.y === null || isNaN(punto.y)) {
        inputY.classList.add('campo-invalido');
      }
    });

    return puntosValidos;
  },

  calcular() {
    try {
      const puntos = this.validar();
      const xPredecir = parseFloat(document.getElementById('inputXPredecir').value);
      const grado = parseInt(document.getElementById('gradoPolinomio').value);

      if (isNaN(xPredecir)) {
        throw new Error('El valor de x a predecir debe ser un número válido');
      }

      const n = puntos.length;
      const sumatorias = this.calcularSumatorias(puntos, grado);
      const matriz = this.construirMatriz(sumatorias, grado);
      const coeficientes = this.resolverSistema(matriz);
      const yPredicho = this.evaluar(coeficientes, xPredecir);
      const ecm = this.calcularECM(puntos, coeficientes);
      const r2 = this.calcularR2(puntos, coeficientes);

      this.estado.resultado = {
        puntos,
        grado,
        xPredecir,
        yPredicho,
        sumatorias,
        matriz,
        coeficientes,
        ecm,
        r2
      };

      this.mostrarResultado();
      this.mostrarDesarrollo();
      this.graficar();

      alert(`Ajuste calculado correctamente. Predicción: y(${xPredecir}) = ${this.formatear(yPredicho)}`);

    } catch (error) {
      alert('Error: ' + error.message);
    }
  },

  calcularSumatorias(puntos, grado) {
    const n = puntos.length;
    const sumatorias = { n };

    for (let p = 0; p <= grado * 2; p++) {
      const clave = `x${p}`;
      sumatorias[clave] = puntos.reduce((suma, punto) => suma + Math.pow(punto.x, p), 0);
    }

    for (let p = 0; p <= grado; p++) {
      const clave = `x${p}y`;
      sumatorias[clave] = puntos.reduce((suma, punto) => 
        suma + Math.pow(punto.x, p) * punto.y, 0);
    }

    sumatorias.y = puntos.reduce((suma, punto) => suma + punto.y, 0);
    sumatorias.y2 = puntos.reduce((suma, punto) => suma + punto.y * punto.y, 0);

    return sumatorias;
  },

  construirMatriz(sumatorias, grado) {
    const matriz = [];

    for (let i = 0; i <= grado; i++) {
      const fila = [];
      for (let j = 0; j <= grado; j++) {
        fila.push(sumatorias[`x${i + j}`]);
      }
      fila.push(sumatorias[`x${i}y`]);
      matriz.push(fila);
    }

    return matriz;
  },

  resolverSistema(matriz) {
    const n = matriz.length;
    const A = matriz.map(fila => fila.slice(0, -1));
    const b = matriz.map(fila => fila[fila.length - 1]);

    for (let i = 0; i < n; i++) {
      let maxFila = i;
      for (let k = i + 1; k < n; k++) {
        if (Math.abs(A[k][i]) > Math.abs(A[maxFila][i])) {
          maxFila = k;
        }
      }

      [A[i], A[maxFila]] = [A[maxFila], A[i]];
      [b[i], b[maxFila]] = [b[maxFila], b[i]];

      for (let k = i + 1; k < n; k++) {
        const factor = A[k][i] / A[i][i];
        for (let j = i; j < n; j++) {
          A[k][j] -= factor * A[i][j];
        }
        b[k] -= factor * b[i];
      }
    }

    const x = new Array(n);
    for (let i = n - 1; i >= 0; i--) {
      x[i] = b[i];
      for (let j = i + 1; j < n; j++) {
        x[i] -= A[i][j] * x[j];
      }
      x[i] /= A[i][i];
    }

    return x;
  },

  evaluar(coeficientes, x) {
    return coeficientes.reduce((suma, coef, i) => suma + coef * Math.pow(x, i), 0);
  },

  calcularECM(puntos, coeficientes) {
    const errores = puntos.map(p => {
      const yPredicho = this.evaluar(coeficientes, p.x);
      return Math.pow(p.y - yPredicho, 2);
    });
    return errores.reduce((suma, e) => suma + e, 0) / puntos.length;
  },

  calcularR2(puntos, coeficientes) {
    const yMedia = puntos.reduce((suma, p) => suma + p.y, 0) / puntos.length;
    
    const ssTotal = puntos.reduce((suma, p) => 
      suma + Math.pow(p.y - yMedia, 2), 0);
    
    const ssResidual = puntos.reduce((suma, p) => {
      const yPredicho = this.evaluar(coeficientes, p.x);
      return suma + Math.pow(p.y - yPredicho, 2);
    }, 0);

    return 1 - (ssResidual / ssTotal);
  },

  formatear(numero) {
    if (Number.isInteger(numero)) {
      return numero.toString();
    }
    return parseFloat(numero.toFixed(6)).toString();
  },

  construirEcuacion(coeficientes) {
    const terminos = coeficientes.map((coef, i) => {
      if (i === 0) return this.formatear(coef);
      if (i === 1) return `${coef >= 0 ? '+' : ''}${this.formatear(coef)}x`;
      return `${coef >= 0 ? '+' : ''}${this.formatear(coef)}x^${i}`;
    });
    return 'y = ' + terminos.join(' ');
  },

  mostrarResultado() {
    const r = this.estado.resultado;
    if (!r) return;

    const nombreX = document.getElementById('nombreEjeX').value || 'x';
    const nombreY = document.getElementById('nombreEjeY').value || 'y';
    const ecuacion = this.construirEcuacion(r.coeficientes);

    let html = `
      <div class="ecuacion-ajuste">
        <p class="etiqueta-resultado">Ecuación de ajuste (Grado ${r.grado}):</p>
        <p class="valor-resultado">${ecuacion}</p>
      </div>

      <div class="resultado-principal">
        <p class="etiqueta-resultado">Predicción en ${nombreX} = ${this.formatear(r.xPredecir)}:</p>
        <p class="valor-resultado">${nombreY} = ${this.formatear(r.yPredicho)}</p>
      </div>

      <div class="resultado-principal">
        <p class="etiqueta-resultado">Error Cuadrático Medio (ECM):</p>
        <p class="valor-resultado">${this.formatear(r.ecm)}</p>
      </div>

      <div class="resultado-principal">
        <p class="etiqueta-resultado">Coeficiente de Determinación (R²):</p>
        <p class="valor-resultado">${this.formatear(r.r2)} (${(r.r2 * 100).toFixed(2)}%)</p>
      </div>
    `;

    document.getElementById('contenedorResultado').innerHTML = html;
  },

  mostrarDesarrollo() {
    const r = this.estado.resultado;
    if (!r) return;

    const nombreX = document.getElementById('nombreEjeX').value || 'x';
    const nombreY = document.getElementById('nombreEjeY').value || 'y';

    let latex = `
      <div class="paso-desarrollo">
        <h4>Paso 1: Datos Experimentales</h4>
        <table class="tabla-desarrollo">
          <thead>
            <tr>
              <th>i</th>
              <th>${nombreX}</th>
              <th>${nombreY}</th>
            </tr>
          </thead>
          <tbody>
    `;

    r.puntos.forEach((p, i) => {
      latex += `
        <tr>
          <td>${i}</td>
          <td>${this.formatear(p.x)}</td>
          <td>${this.formatear(p.y)}</td>
        </tr>
      `;
    });

    latex += `
          </tbody>
        </table>
        <p>Número total de puntos: n = ${r.sumatorias.n}</p>
      </div>

      <div class="paso-desarrollo">
        <h4>Paso 2: Sumatorias Necesarias</h4>
        <p>Para un polinomio de grado ${r.grado}, necesitamos calcular:</p>
    `;

    for (let p = 0; p <= r.grado * 2; p++) {
      latex += `<p class="linea-calculo">$$\\sum ${nombreX}^${p} = ${this.formatear(r.sumatorias[`x${p}`])}$$</p>`;
    }

    for (let p = 0; p <= r.grado; p++) {
      if (p === 0) {
        latex += `<p class="linea-calculo">$$\\sum ${nombreY} = ${this.formatear(r.sumatorias[`x${p}y`])}$$</p>`;
      } else {
        latex += `<p class="linea-calculo">$$\\sum ${nombreX}^${p}${nombreY} = ${this.formatear(r.sumatorias[`x${p}y`])}$$</p>`;
      }
    }

    latex += `</div>`;

    latex += `
      <div class="paso-desarrollo">
        <h4>Paso 3: Sistema de Ecuaciones Normales</h4>
        <p>El sistema en forma matricial: $$(A^T A)a = A^T y$$</p>
        <p>Matriz aumentada:</p>
    `;

    latex += `<p>$$\\begin{bmatrix}`;
    for (let i = 0; i <= r.grado; i++) {
      for (let j = 0; j <= r.grado; j++) {
        latex += this.formatear(r.matriz[i][j]);
        if (j < r.grado) latex += ' & ';
      }
      latex += ' & | & ' + this.formatear(r.matriz[i][r.grado + 1]);
      if (i < r.grado) latex += ' \\\\ ';
    }
    latex += `\\end{bmatrix}$$</p>`;

    latex += `</div>`;

    latex += `
      <div class="paso-desarrollo">
        <h4>Paso 4: Coeficientes del Polinomio</h4>
        <p>Resolviendo el sistema por eliminación gaussiana:</p>
    `;

    r.coeficientes.forEach((coef, i) => {
      latex += `<p class="linea-calculo">$$a_{${i}} = ${this.formatear(coef)}$$</p>`;
    });

    latex += `</div>`;

    const ecuacion = this.construirEcuacion(r.coeficientes);
    latex += `
      <div class="paso-desarrollo">
        <h4>Paso 5: Ecuación de Ajuste</h4>
        <p class="linea-calculo">$$${ecuacion.replace(/\+/g, '+')}$$</p>
      </div>

      <div class="paso-desarrollo">
        <h4>Paso 6: Predicción</h4>
        <p>Para ${nombreX} = ${this.formatear(r.xPredecir)}:</p>
        <p class="linea-calculo">$$${nombreY} = ${r.coeficientes.map((coef, i) => {
          if (i === 0) return this.formatear(coef);
          if (i === 1) return `${coef >= 0 ? '+' : ''}${this.formatear(coef)}(${this.formatear(r.xPredecir)})`;
          return `${coef >= 0 ? '+' : ''}${this.formatear(coef)}(${this.formatear(r.xPredecir)})^${i}`;
        }).join(' ')}$$</p>
        <p class="linea-calculo">$$${nombreY} = ${this.formatear(r.yPredicho)}$$</p>
      </div>

      <div class="paso-desarrollo">
        <h4>Paso 7: Calidad del Ajuste</h4>
        <p>Error Cuadrático Medio:</p>
        <p class="linea-calculo">$$ECM = \\frac{1}{n}\\sum_{i=1}^{n}(y_i - \\hat{y}_i)^2 = ${this.formatear(r.ecm)}$$</p>
        <p>Coeficiente de Determinación:</p>
        <p class="linea-calculo">$$R^2 = ${this.formatear(r.r2)} = ${(r.r2 * 100).toFixed(2)}\\%$$</p>
        <p>${r.r2 > 0.9 ? 'Excelente ajuste' : r.r2 > 0.7 ? 'Buen ajuste' : 'Ajuste aceptable'}</p>
      </div>

      <div class="resultado-final">
        <strong>Resultado Final:</strong>
        <p>Ecuación: ${ecuacion}</p>
        <p>Predicción: ${nombreY}(${this.formatear(r.xPredecir)}) = ${this.formatear(r.yPredicho)}</p>
      </div>
    `;

    document.getElementById('contenedorDesarrollo').innerHTML = latex;

    if (window.MathJax) {
      MathJax.typesetPromise();
    }
  },

  graficar() {
    const r = this.estado.resultado;
    if (!r) return;

    const xs = r.puntos.map(p => p.x);
    const xMin = Math.min(...xs);
    const xMax = Math.max(...xs);
    const rango = xMax - xMin;
    const inicio = xMin - rango * 0.1;
    const fin = xMax + rango * 0.1;

    const puntosAjuste = [];
    const numPuntos = 200;
    const paso = (fin - inicio) / numPuntos;

    for (let i = 0; i <= numPuntos; i++) {
      const x = inicio + i * paso;
      const y = this.evaluar(r.coeficientes, x);
      puntosAjuste.push({ x, y });
    }

    const traza1 = {
      x: puntosAjuste.map(p => p.x),
      y: puntosAjuste.map(p => p.y),
      mode: 'lines',
      name: `Ajuste (grado ${r.grado})`,
      line: { color: '#1e40af', width: 3 }
    };

    const traza2 = {
      x: r.puntos.map(p => p.x),
      y: r.puntos.map(p => p.y),
      mode: 'markers',
      name: 'Datos experimentales',
      marker: {
        color: '#dc2626',
        size: 12,
        symbol: 'circle',
        line: { color: 'white', width: 2 }
      }
    };

    const traza3 = {
      x: [r.xPredecir],
      y: [r.yPredicho],
      mode: 'markers',
      name: `Predicción`,
      marker: {
        color: '#10b981',
        size: 14,
        symbol: 'diamond',
        line: { color: 'white', width: 2 }
      }
    };

    const titulo = document.getElementById('tituloExperimento').value || 'Ajuste por Mínimos Cuadrados';
    const nombreX = document.getElementById('nombreEjeX').value || 'x';
    const nombreY = document.getElementById('nombreEjeY').value || 'y';

    const layout = {
      title: {
        text: titulo,
        font: { size: 18, color: '#1e293b', family: 'Inter, system-ui, sans-serif' }
      },
      xaxis: {
        title: { text: nombreX, font: { size: 14, color: '#475569' } },
        gridcolor: '#e2e8f0',
        showgrid: true,
        zeroline: true
      },
      yaxis: {
        title: { text: nombreY, font: { size: 14, color: '#475569' } },
        gridcolor: '#e2e8f0',
        showgrid: true,
        zeroline: true
      },
      plot_bgcolor: '#ffffff',
      paper_bgcolor: '#ffffff',
      showlegend: true,
      legend: {
        x: 1,
        y: 1,
        xanchor: 'right',
        yanchor: 'top',
        bgcolor: 'rgba(255, 255, 255, 0.9)',
        bordercolor: '#cbd5e1',
        borderwidth: 1
      },
      margin: { l: 70, r: 40, t: 80, b: 60 },
      hovermode: 'closest'
    };

    const config = {
      responsive: true,
      displayModeBar: true,
      displaylogo: false
    };

    Plotly.newPlot('graficoMinimos', [traza1, traza2, traza3], layout, config);
  },

  alternarPasos() {
    if (!this.estado.resultado) {
      alert('Primero calcula el ajuste');
      return;
    }

    const seccion = document.getElementById('seccionDesarrollo');
    const boton = document.getElementById('btnTogglePasos');

    if (seccion.classList.contains('oculto')) {
      seccion.classList.remove('oculto');
      seccion.setAttribute('aria-hidden', 'false');
      boton.textContent = 'Ocultar desarrollo';
    } else {
      seccion.classList.add('oculto');
      seccion.setAttribute('aria-hidden', 'true');
      boton.textContent = 'Abrir desarrollo';
    }
  },

  alternarMenu() {
    const menu = document.getElementById('menuNavegacion');
    menu.classList.toggle('menu-activo');
  },

  cargarEjemplo() {
    document.getElementById('tituloExperimento').value = 'Distancia de frenado vs Velocidad';
    document.getElementById('nombreEjeX').value = 'Velocidad (m/s)';
    document.getElementById('nombreEjeY').value = 'Distancia (m)';
    document.getElementById('inputXPredecir').value = '25';
    document.getElementById('gradoPolinomio').value = '2';

    this.estado.puntos = [
      { x: 10, y: 6 },
      { x: 20, y: 25 },
      { x: 30, y: 60 },
      { x: 40, y: 110 }
    ];

    this.renderizarTabla();
    this.actualizarEncabezados();

    alert('Ejemplo cargado correctamente');
  }
};

document.addEventListener('DOMContentLoaded', () => {
  App.iniciar();
});
