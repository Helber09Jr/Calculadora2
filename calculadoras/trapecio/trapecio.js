const App = {
  estado: { resultado: null },

  iniciar() {
    document.getElementById('btnCalcular').onclick = () => this.calcular();
    document.getElementById('btnLimpiarTodo').onclick = () => this.limpiarTodo();
    document.getElementById('btnEjemplo').onclick = () => this.cargarEjemplo();
    document.getElementById('btnTogglePasos').onclick = () => this.alternarPasos();
    document.getElementById('botonMenu').onclick = () => this.alternarMenu();
  },

  limpiarTodo() {
    if (confirm('¿Estás seguro de limpiar todos los datos?')) {
      this.estado.resultado = null;
      document.getElementById('inputFuncion').value = 'x**2';
      document.getElementById('inputA').value = '0';
      document.getElementById('inputB').value = '1';
      document.getElementById('inputN').value = '10';
      document.getElementById('tituloExperimento').value = '';
      document.getElementById('contenedorResultado').innerHTML = '';
      document.getElementById('contenedorDesarrollo').innerHTML = '';
      document.getElementById('graficoTrapecio').innerHTML = '';

      const seccion = document.getElementById('seccionDesarrollo');
      if (!seccion.classList.contains('oculto')) {
        seccion.classList.add('oculto');
        seccion.setAttribute('aria-hidden', 'true');
        document.getElementById('btnTogglePasos').textContent = 'Abrir desarrollo';
      }

      alert('Todos los datos han sido limpiados correctamente');
    }
  },

  evaluarFuncion(expr, x) {
    try {
      return new Function('x', `return ${expr}`)(x);
    } catch (e) {
      throw new Error(`Error en la expresión: ${expr}`);
    }
  },

  validar() {
    const expr = document.getElementById('inputFuncion').value.trim();
    const a = parseFloat(document.getElementById('inputA').value);
    const b = parseFloat(document.getElementById('inputB').value);
    const n = parseInt(document.getElementById('inputN').value);

    if (!expr) throw new Error('Ingrese una función f(x)');
    if (isNaN(a) || isNaN(b)) throw new Error('Los límites deben ser números válidos');
    if (a >= b) throw new Error('El límite inferior debe ser menor que el superior');
    if (isNaN(n) || n < 1) throw new Error('n debe ser al menos 1');

    return { expr, a, b, n };
  },

  calcular() {
    try {
      const { expr, a, b, n } = this.validar();
      const h = (b - a) / n;
      const puntos = [];
      let suma = this.evaluarFuncion(expr, a) + this.evaluarFuncion(expr, b);

      for (let i = 1; i < n; i++) {
        const xi = a + i * h;
        const fxi = this.evaluarFuncion(expr, xi);
        suma += 2 * fxi;
        puntos.push({ x: parseFloat(xi.toFixed(6)), y: parseFloat(fxi.toFixed(6)), coef: 2 });
      }

      puntos.unshift({ x: a, y: this.evaluarFuncion(expr, a), coef: 1 });
      puntos.push({ x: b, y: this.evaluarFuncion(expr, b), coef: 1 });

      const integral = (h / 2) * suma;

      this.estado.resultado = { expr, a, b, n, h, integral, puntos };
      this.mostrarResultado();
      this.mostrarDesarrollo();
      this.graficar();

      alert(`Integral calculada correctamente: aproximadamente ${this.formatear(integral)}`);
    } catch (error) {
      alert('Error: ' + error.message);
    }
  },

  formatear(n) {
    return Number.isInteger(n) ? n.toString() : parseFloat(n.toFixed(6)).toString();
  },

  mostrarResultado() {
    const r = this.estado.resultado;
    let html = `
      <div class="resultado-principal">
        <p class="etiqueta-resultado">Integral a calcular:</p>
        <p style="font-family: monospace; background: var(--gris-claro); padding: 8px; border-radius: 4px;">∫<sub>${this.formatear(r.a)}</sub><sup>${this.formatear(r.b)}</sup> (${r.expr}) dx</p>
        <p class="etiqueta-resultado" style="margin-top: 12px;">Método: Regla del Trapecio</p>
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
        <h4>Paso 1: Fórmula de la Regla del Trapecio</h4>
        <p>La regla del trapecio es un método de integración numérica que aproxima el área bajo una curva usando trapecios:</p>
        <p>$$\\int_a^b f(x)dx \\approx \\frac{h}{2}[f(x_0) + 2f(x_1) + 2f(x_2) + ... + 2f(x_{n-1}) + f(x_n)]$$</p>
        <p style="margin-top: 12px; color: var(--gris-texto);">donde:</p>
        <p>$$h = \\frac{b-a}{n}$$</p>
        <p style="margin-top: 12px; font-size: 0.9em; color: var(--gris-texto);">Los coeficientes siguen el patrón: 1, 2, 2, 2, ..., 2, 1</p>
      </div>

      <div class="paso-desarrollo">
        <h4>Paso 2: Parámetros de Integración</h4>
        <p><strong>Función a integrar:</strong></p>
        <p>$$f(x) = ${r.expr}$$</p>
        <p style="margin-top: 12px;"><strong>Límites de integración:</strong></p>
        <p>$$a = ${this.formatear(r.a)}, \\quad b = ${this.formatear(r.b)}$$</p>
        <p style="margin-top: 12px;"><strong>Tamaño de paso:</strong></p>
        <p>$$h = \\frac{${this.formatear(r.b)} - ${this.formatear(r.a)}}{${r.n}} = ${this.formatear(r.h)}$$</p>
      </div>

      <div class="paso-desarrollo">
        <h4>Paso 3: Evaluación de la Función en los Puntos</h4>
        <p style="margin-bottom: 15px; color: var(--gris-texto);">Se evalúa f(x) en cada punto de la partición con sus coeficientes respectivos:</p>
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
        <p style="margin-bottom: 12px;">Se calcula la suma:</p>
    `;

    let sumaTexto = 'S = ';
    r.puntos.forEach((p, i) => {
      sumaTexto += `${p.coef} \\times ${this.formatear(p.y)}`;
      if (i < r.puntos.length - 1) sumaTexto += ' + ';
    });

    latex += `
        <p class="linea-calculo">$$${sumaTexto}$$</p>
    `;

    latex += `
        <p style="margin-top: 12px;">Finalmente, se aplica la regla del trapecio:</p>
        <p class="linea-calculo">$$\\int \\approx \\frac{h}{2} \\times S = \\frac{${this.formatear(r.h)}}{2} \\times S = ${this.formatear(r.integral)}$$</p>
      </div>

      <div class="resultado-final">
        <strong>Resultado Final:</strong>
        <p>$$\\int_{${this.formatear(r.a)}}^{${this.formatear(r.b)}} ${r.expr} \\, dx \\approx ${this.formatear(r.integral)}$$</p>
        <p style="margin-top: 12px; color: var(--gris-texto); font-size: 0.9em;">Aproximación mediante Regla del Trapecio con ${r.n} intervalos</p>
      </div>
    `;

    document.getElementById('contenedorDesarrollo').innerHTML = latex;
    window.MathJax && MathJax.typesetPromise();
  },

  graficar() {
    const r = this.estado.resultado;
    const xs = [], ys = [];
    for (let i = 0; i <= 100; i++) {
      const x = r.a + (i / 100) * (r.b - r.a);
      xs.push(x);
      ys.push(this.evaluarFuncion(r.expr, x));
    }

    const layout = {
      title: {
        text: document.getElementById('tituloExperimento').value || `Integral: ∫ ${r.expr} dx`,
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
      plot_bgcolor: '#fff',
      paper_bgcolor: '#fff',
      showlegend: true,
      legend: {
        x: 1, y: 1,
        xanchor: 'right', yanchor: 'top',
        bgcolor: 'rgba(255, 255, 255, 0.9)',
        bordercolor: '#cbd5e1',
        borderwidth: 1
      },
      margin: { l: 70, r: 40, t: 80, b: 60 }
    };

    Plotly.newPlot('graficoTrapecio', [
      { x: xs, y: ys, mode: 'lines', name: `f(x) = ${r.expr}`, line: { color: '#1e40af', width: 2 }, fill: 'tozeroy', fillcolor: 'rgba(30, 64, 175, 0.2)' },
      { x: r.puntos.map(p => p.x), y: r.puntos.map(p => p.y), mode: 'markers', name: 'Puntos de evaluación', marker: { size: 5, color: '#dc2626' } }
    ], layout, { responsive: true, displayModeBar: true, displaylogo: false });
  },

  alternarPasos() {
    if (!this.estado.resultado) return alert('Primero calcula la integral');
    const sec = document.getElementById('seccionDesarrollo');
    sec.classList.toggle('oculto');
    document.getElementById('btnTogglePasos').textContent = sec.classList.contains('oculto') ? 'Abrir desarrollo' : 'Ocultar desarrollo';
  },

  alternarMenu() {
    document.getElementById('menuNavegacion').classList.toggle('menu-activo');
  },

  cargarEjemplo() {
    document.getElementById('tituloExperimento').value = 'Área bajo la parábola';
    document.getElementById('inputFuncion').value = 'x**2';
    document.getElementById('inputA').value = '0';
    document.getElementById('inputB').value = '1';
    document.getElementById('inputN').value = '10';
    alert('Ejemplo cargado correctamente');
  }
};

document.addEventListener('DOMContentLoaded', () => App.iniciar());
