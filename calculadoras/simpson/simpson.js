const App = {
  estado: {
    resultado: null
  },

  iniciar() {
    this.vincularEventos();
  },

  vincularEventos() {
    document.getElementById('btnCalcular').onclick = () => this.calcular();
    document.getElementById('btnLimpiarTodo').onclick = () => this.limpiarTodo();
    document.getElementById('btnEjemplo').onclick = () => this.cargarEjemplo();
    document.getElementById('btnTogglePasos').onclick = () => this.alternarPasos();
    document.getElementById('botonMenu').onclick = () => this.alternarMenu();
  },

  limpiarTodo() {
    if (confirm('¿Estás seguro de limpiar todos los datos?')) {
      this.estado.resultado = null;
      document.getElementById('tituloExperimento').value = '';
      document.getElementById('inputFuncion').value = 'x**2';
      document.getElementById('inputA').value = '0';
      document.getElementById('inputB').value = '1';
      document.getElementById('inputN').value = '10';
      document.getElementById('selectMetodo').value = '13';
      document.getElementById('contenedorResultado').innerHTML = '';
      document.getElementById('contenedorDesarrollo').innerHTML = '';
      document.getElementById('graficoSimpson').innerHTML = '';

      const seccion = document.getElementById('seccionDesarrollo');
      if (!seccion.classList.contains('oculto')) {
        seccion.classList.add('oculto');
        seccion.setAttribute('aria-hidden', 'true');
        document.getElementById('btnTogglePasos').textContent = 'Abrir desarrollo';
      }

      alert('Todos los datos han sido limpiados correctamente');
    }
  },

  evaluarFuncion(expresion, x) {
    try {
      const func = new Function('x', `return ${expresion}`);
      return func(x);
    } catch (error) {
      throw new Error(`Error en la expresión: ${expresion}`);
    }
  },

  validar() {
    const expresion = document.getElementById('inputFuncion').value.trim();
    const a = parseFloat(document.getElementById('inputA').value);
    const b = parseFloat(document.getElementById('inputB').value);
    const n = parseInt(document.getElementById('inputN').value);
    const metodo = document.getElementById('selectMetodo').value;

    if (!expresion) {
      throw new Error('Debe ingresar una función f(x)');
    }

    if (isNaN(a)) {
      throw new Error('El límite inferior a debe ser un número válido');
    }

    if (isNaN(b)) {
      throw new Error('El límite superior b debe ser un número válido');
    }

    if (a >= b) {
      throw new Error('El límite inferior a debe ser menor que el límite superior b');
    }

    if (isNaN(n) || n < 2) {
      throw new Error('Debe ingresar al menos 2 intervalos');
    }

    if (metodo === '13' && n % 2 !== 0) {
      throw new Error('Simpson 1/3 requiere un número par de intervalos');
    }

    if (metodo === '38' && n % 3 !== 0) {
      throw new Error('Simpson 3/8 requiere un número múltiplo de 3');
    }

    try {
      this.evaluarFuncion(expresion, a);
    } catch (error) {
      throw error;
    }

    return { expresion, a, b, n, metodo };
  },

  simpson13(f, a, b, n) {
    const h = (b - a) / n;
    let suma = f(a) + f(b);
    let puntos = [{ x: a, y: f(a), coef: 1 }];

    for (let i = 1; i < n; i++) {
      const xi = a + i * h;
      const fxi = f(xi);
      const coef = (i % 2 === 0) ? 2 : 4;
      suma += coef * fxi;
      puntos.push({ x: xi, y: fxi, coef });
    }

    puntos.push({ x: b, y: f(b), coef: 1 });

    const integral = (h / 3) * suma;
    return { integral, h, puntos };
  },

  simpson38(f, a, b, n) {
    const h = (b - a) / n;
    let suma = f(a) + f(b);
    let puntos = [{ x: a, y: f(a), coef: 1 }];

    for (let i = 1; i < n; i++) {
      const xi = a + i * h;
      const fxi = f(xi);
      let coef;
      if (i % 3 === 0) {
        coef = 2;
      } else {
        coef = 3;
      }
      suma += coef * fxi;
      puntos.push({ x: xi, y: fxi, coef });
    }

    puntos.push({ x: b, y: f(b), coef: 1 });

    const integral = (3 * h / 8) * suma;
    return { integral, h, puntos };
  },

  calcular() {
    try {
      const { expresion, a, b, n, metodo } = this.validar();

      const f = (x) => this.evaluarFuncion(expresion, x);

      let resultado;
      if (metodo === '13') {
        resultado = this.simpson13(f, a, b, n);
        resultado.metodo = 'Simpson 1/3';
      } else {
        resultado = this.simpson38(f, a, b, n);
        resultado.metodo = 'Simpson 3/8';
      }

      this.estado.resultado = {
        expresion, a, b, n, metodo,
        ...resultado
      };

      this.mostrarResultado();
      this.mostrarDesarrollo();
      this.graficar();

      alert(`Integral calculada correctamente: aproximadamente ${this.formatear(resultado.integral)}`);

    } catch (error) {
      alert('Error: ' + error.message);
    }
  },

  formatear(numero) {
    if (Number.isInteger(numero)) {
      return numero.toString();
    }
    return parseFloat(numero.toFixed(6)).toString();
  },

  mostrarResultado() {
    const r = this.estado.resultado;
    if (!r) return;

    let html = `
      <div class="resultado-principal">
        <p class="etiqueta-resultado">Integral a calcular:</p>
        <p style="font-family: monospace; background: var(--gris-claro); padding: 8px; border-radius: 4px;">∫<sub>${this.formatear(r.a)}</sub><sup>${this.formatear(r.b)}</sup> (${r.expresion}) dx</p>
        <p class="etiqueta-resultado" style="margin-top: 12px;">Método utilizado: <strong>${r.metodo}</strong></p>
        <p style="color: var(--gris-texto); font-size: 0.9em;">Intervalos: n = ${r.n}, Tamaño de paso: h = ${this.formatear(r.h)}</p>
      </div>

      <div class="resultado-evaluacion" style="margin-top: 20px;">
        <p class="etiqueta-resultado">Resultado de la integral:</p>
        <p class="valor-resultado" style="font-size: 1.5em; color: var(--verde-exito);">∫ ≈ ${this.formatear(r.integral)}</p>
      </div>

      <table class="tabla-resultados" style="margin-top: 20px;">
        <thead>
          <tr>
            <th>i</th>
            <th>x<sub>i</sub></th>
            <th>f(x<sub>i</sub>)</th>
            <th>Coeficiente</th>
          </tr>
        </thead>
        <tbody>
    `;

    r.puntos.forEach((p, i) => {
      html += `
        <tr>
          <td>${i}</td>
          <td>${this.formatear(p.x)}</td>
          <td>${this.formatear(p.y)}</td>
          <td>${p.coef}</td>
        </tr>
      `;
    });

    html += '</tbody></table>';
    document.getElementById('contenedorResultado').innerHTML = html;
  },

  mostrarDesarrollo() {
    const r = this.estado.resultado;
    if (!r) return;

    let latex = `
      <div class="paso-desarrollo">
        <h4>Paso 1: Fórmula de ${r.metodo}</h4>
    `;

    if (r.metodo === 'Simpson 1/3') {
      latex += `
        <p>La regla de Simpson 1/3 aproxima una integral usando parábolas:</p>
        <p>$$\\int_a^b f(x)dx \\approx \\frac{h}{3}[f(x_0) + 4f(x_1) + 2f(x_2) + 4f(x_3) + ... + 4f(x_{n-1}) + f(x_n)]$$</p>
        <p style="margin-top: 12px; color: var(--gris-texto);">donde:</p>
        <p>$$h = \\frac{b-a}{n}, \\quad n \\text{ es par}$$</p>
        <p style="margin-top: 12px; font-size: 0.9em; color: var(--gris-texto);">Los coeficientes siguen el patrón: 1, 4, 2, 4, 2, ..., 4, 1</p>
      `;
    } else {
      latex += `
        <p>La regla de Simpson 3/8 aproxima una integral usando polinomios cúbicos:</p>
        <p>$$\\int_a^b f(x)dx \\approx \\frac{3h}{8}[f(x_0) + 3f(x_1) + 3f(x_2) + 2f(x_3) + ... + 3f(x_{n-1}) + f(x_n)]$$</p>
        <p style="margin-top: 12px; color: var(--gris-texto);">donde:</p>
        <p>$$h = \\frac{b-a}{n}, \\quad n \\text{ es múltiplo de 3}$$</p>
        <p style="margin-top: 12px; font-size: 0.9em; color: var(--gris-texto);">Los coeficientes siguen el patrón: 1, 3, 3, 2, 3, 3, 2, ..., 3, 1</p>
      `;
    }

    latex += `
      </div>

      <div class="paso-desarrollo">
        <h4>Paso 2: Parámetros de Integración</h4>
        <p><strong>Función a integrar:</strong></p>
        <p>$$f(x) = ${r.expresion}$$</p>
        <p style="margin-top: 12px;"><strong>Límites de integración:</strong></p>
        <p>$$a = ${this.formatear(r.a)}, \\quad b = ${this.formatear(r.b)}$$</p>
        <p style="margin-top: 12px;"><strong>Tamaño de paso:</strong></p>
        <p>$$h = \\frac{${this.formatear(r.b)} - ${this.formatear(r.a)}}{${r.n}} = ${this.formatear(r.h)}$$</p>
      </div>

      <div class="paso-desarrollo">
        <h4>Paso 3: Evaluación de la Función en los Puntos</h4>
        <p style="margin-bottom: 15px; color: var(--gris-texto);">Se evalúa f(x) en cada punto de la partición:</p>
        <table class="tabla-desarrollo">
          <thead>
            <tr>
              <th>i</th>
              <th>x<sub>i</sub></th>
              <th>f(x<sub>i</sub>)</th>
              <th>Coeficiente c<sub>i</sub></th>
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
          <td>${p.coef}</td>
        </tr>
      `;
    });

    latex += `
          </tbody>
        </table>
      </div>

      <div class="paso-desarrollo">
        <h4>Paso 4: Cálculo de la Suma Ponderada</h4>
        <p style="margin-bottom: 12px;">Se calcula:</p>
    `;

    let sumaTexto = 'S = ';
    r.puntos.forEach((p, i) => {
      sumaTexto += `${p.coef} \\times ${this.formatear(p.y)}`;
      if (i < r.puntos.length - 1) sumaTexto += ' + ';
    });

    latex += `
        <p class="linea-calculo">$$${sumaTexto}$$</p>
    `;

    const metodoCoef = r.metodo === 'Simpson 1/3' ? '\\frac{h}{3}' : '\\frac{3h}{8}';

    latex += `
        <p style="margin-top: 12px;">Finalmente:</p>
        <p class="linea-calculo">$$\\int \\approx ${metodoCoef} \\times S = ${metodoCoef} \\times (\\text{suma}) = ${this.formatear(r.integral)}$$</p>
      </div>

      <div class="resultado-final">
        <strong>Resultado Final:</strong>
        <p>$$\\int_{${this.formatear(r.a)}}^{${this.formatear(r.b)}} ${r.expresion} \\, dx \\approx ${this.formatear(r.integral)}$$</p>
        <p style="margin-top: 12px; color: var(--gris-texto); font-size: 0.9em;">Aproximación mediante ${r.metodo} con ${r.n} intervalos</p>
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

    const numPuntos = 200;
    const xs = [];
    const ys = [];

    for (let i = 0; i <= numPuntos; i++) {
      const x = r.a + (i / numPuntos) * (r.b - r.a);
      xs.push(x);
      ys.push(this.evaluarFuncion(r.expresion, x));
    }

    const trazaFuncion = {
      x: xs,
      y: ys,
      mode: 'lines',
      name: `f(x) = ${r.expresion}`,
      line: { color: '#1e40af', width: 2 },
      fill: 'tozeroy',
      fillcolor: 'rgba(30, 64, 175, 0.2)'
    };

    const trazaPuntos = {
      x: r.puntos.map(p => p.x),
      y: r.puntos.map(p => p.y),
      mode: 'markers',
      name: 'Puntos de evaluación',
      marker: { size: 6, color: '#dc2626' }
    };

    const titulo = document.getElementById('tituloExperimento').value ||
                   `Integral: ∫ ${r.expresion} dx`;

    const layout = {
      title: {
        text: titulo,
        font: { size: 18, color: '#1e293b', family: 'Inter, system-ui, sans-serif' }
      },
      xaxis: {
        title: { text: 'x', font: { size: 14, color: '#475569' } },
        gridcolor: '#e2e8f0',
        showgrid: true,
        zeroline: true,
        zerolinecolor: '#94a3b8'
      },
      yaxis: {
        title: { text: 'f(x)', font: { size: 14, color: '#475569' } },
        gridcolor: '#e2e8f0',
        showgrid: true,
        zeroline: true,
        zerolinecolor: '#94a3b8'
      },
      plot_bgcolor: '#ffffff',
      paper_bgcolor: '#ffffff',
      showlegend: true,
      legend: {
        x: 1, y: 1,
        xanchor: 'right', yanchor: 'top',
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

    Plotly.newPlot('graficoSimpson', [trazaFuncion, trazaPuntos], layout, config);
  },

  alternarPasos() {
    if (!this.estado.resultado) {
      alert('Primero calcula la integral');
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
    document.getElementById('tituloExperimento').value = 'Área bajo la parábola';
    document.getElementById('inputFuncion').value = 'x**2';
    document.getElementById('inputA').value = '0';
    document.getElementById('inputB').value = '1';
    document.getElementById('inputN').value = '10';
    document.getElementById('selectMetodo').value = '13';

    alert('Ejemplo cargado correctamente');
  }
};

document.addEventListener('DOMContentLoaded', () => {
  App.iniciar();
});
